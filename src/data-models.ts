
const ResponseTypes = ['json','text','blob','buffer','arrayBuffer'] as const;
export const ContentTypes = ["application/json", "application/x-www-form-urlencoded", "multipart/form-data"] as const;

export type ResponseType = typeof ResponseTypes[number];
export type Method = 'get' | 'post' | 'put' | 'delete';

export interface SimpleHeader extends Record<string,string> {
    "Accept": string;
    "Content-Type": typeof ContentTypes[number];
};

export interface IRequiredConfig {
    baseUri: string;
    resType: ResponseType;
};

export interface IOptionsConfig {
    header: SimpleHeader;
    logging: ISimpleLogger;
    errorCallback(e: Error): Promise<void>;
};
export type IConfig = IRequiredConfig & Partial<IOptionsConfig>;

export type ISimpleLogger = Pick<Console, 'info' | 'error'>;

export interface IRequiredParameters {
    path: string;
};
export interface IOptionsParameters<ReqT = any> {
    req: ReqT;
    header: SimpleHeader;
    resType: ResponseType;
};
export type IParameters<ReqT> = IRequiredParameters & Partial<IOptionsParameters<ReqT>>

export interface IApiClient {
    get<ResT,ReqT=any>(params: IParameters<ReqT>): Promise<ResT>;
    post<ResT,ReqT=any>(params: IParameters<ReqT>): Promise<ResT>;
    put<ResT,ReqT=any>(params: IParameters<ReqT>): Promise<ResT>;
    delete<ResT,ReqT=any>(params: IParameters<ReqT>): Promise<ResT>;
};