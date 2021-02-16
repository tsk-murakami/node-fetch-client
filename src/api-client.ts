
import fetch, { Response } from "node-fetch";
import { stringify } from "querystring";

import { IConfig, IApiClient, ISimpleLogger, IParameters, SimpleHeader, ResponseType, Method } from "./data-models";
import { DEFAULT_HEADER, DEFAULT_RESPONSE_TYPE } from "./constant";

import { isObject, generateRestLikeUrl } from "./utils";

export class ApiClient implements IApiClient {
    private _config: IConfig;
    private _header: SimpleHeader;
    private _responseType: ResponseType;
    private __logger: ISimpleLogger;

    constructor( config: IConfig ) {
        this._config = config;
        this._header = Object.assign({}, DEFAULT_HEADER, config.header);
        this._responseType = config.resType || DEFAULT_RESPONSE_TYPE;

        this.__logger = config.logging || console
    }

    async post<ResT, ReqT=any>( params: IParameters<ReqT> ){
        const { resType } = params;
        const res = await this._action(params, 'post')
        return await this._ensureParseResponse(res, resType || this._responseType) as ResT;
    };

    async put<ResT, ReqT = any>(params: IParameters<ReqT>): Promise<ResT> {
        const { resType } = params;
        const res = await this._action(params, 'put')
        return await this._ensureParseResponse(res, resType || this._responseType) as ResT;
    };

    async delete<ResT, ReqT = any>(params: IParameters<ReqT>): Promise<ResT> {
        const { resType } = params;
        const res = await this._action(params, 'delete')
        return await this._ensureParseResponse(res, resType || this._responseType) as ResT;
    }

    async get<ResT, RequestT = any>(params: IParameters<RequestT>): Promise<ResT> {
        const { path, req, resType, header, pathParams } = params;
        let url = this._makeUrl(path, pathParams);
        if (req){
            const query = stringify(req as any);
            if( query ){
                url += `?${query}`
            };
        };
        const res = await fetch(url, {
            method: "get",
            headers: this._makeHeader(header),
        }).then(this._handleErrors);

        return await this._ensureParseResponse(res, resType || this._responseType) as ResT;
    };

    private _handleErrors = (response: Response) => {
        if (!response.ok) {
            this.__logger.error(response)
            throw Error(response.statusText);
        };
        return response;
    };

    private _makeUrl ( apiUrl: string, pathParams?: Record<string,string|number> ) {
        const sureUrl = generateRestLikeUrl(apiUrl, pathParams || {})
        return this._config.baseUri + sureUrl;
    };

    private _makeHeader( header?: SimpleHeader ){
        return Object.assign({}, this._header, header);
    };

    private _makeBody( header: SimpleHeader, req: any ){
        if( !req ) return undefined;
        switch( header["Content-Type"] ){
            case 'application/json':
                return JSON.stringify(req);
            case 'application/x-www-form-urlencoded':
                return stringify(req as any);
            case 'multipart/form-data':
                const checkObject = isObject(req);
                if( checkObject ){
                    const formData = new FormData();
                    Object.entries(req).forEach( ([key,value]:[ string, any]) => {
                        formData.append(key,value)
                    } )
                    return formData;
                };
                return req;
            default:
                return undefined;
      };
    };

    private _action<ReqT>(params: IParameters<ReqT>, method: Method){
        const { path, req, header, pathParams } = params;
        const sureHeader = this._makeHeader(header);
        const body = this._makeBody(sureHeader,req)
        
        const res = fetch( this._makeUrl(path, pathParams), {
            method: method,
            headers: sureHeader,
            body: body,
        }).then(this._handleErrors);
        return res;
    };
  
    private async _ensureParseResponse<ResT>( res: Response, type: ResponseType ){
        try{
            switch(type){
                case 'json':
                    return await res.json();
                case 'blob':
                    return await res.blob();
                case 'text':
                    return await res.text();
                case 'arrayBuffer':
                    return await res.arrayBuffer();
                case 'buffer':
                    return await res.buffer();
                default:
                    this.__logger.error(`Unknwon response type: ${type}`);
                    throw Error(`Unknwon response type: ${type}`)
            };
        } catch(e){
            this.__logger.error(e);
            return { } as ResT
        };
    };
};

export default ApiClient;
