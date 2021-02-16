# node-fetch-client

## Simple Usage

```js
import ApiClient from "ts-node-fetch-client";

interface IResponse {
    foo: string;
    bar: string;
};

const apiClient = new ApiClient({
    baseUri: "https://example.com/api"
})

async function get(){
    const res = await apiClient.get<IResponse>({
        path: "/sample"
    })
    // The response interface is typed.
    console.log( res.foo );
    console.log( res.bar );
};
```

## APIs for ApiClient
| Name | Description |
| ---- | ---- |
| get | Use get in Method.　|
| post | Use post in Method. |
| put | Use put in Method. |
| delete | Use delete in Method. |

## Parameters for APIs
All APIs have the same parameter format.
| Name | Type | Required | Description |
| ---- | ---- | ---- | ---- |
| path | string | Yes | EX) `/api/resource/` |
| resType | *1 ResponseType | | Default: `resType` when creating ApiClient <br />Obtain a resource according to the specified RequestType. |
| req | any | | Request data for Fetch |
| header | *2 SimpleHeader | | Merge with the original header. |
| pathParams | `Record<string,string|number>` | | If this parameter is specified and the `path` is something like `/:resource/:id`, request with a Rest-like URI. |

## Parameters for ApiClient
| Name | Type | Required | Description |
| ---- | ---- | ---- | ---- |
| baseUri |  string  | Yes | The base URL for API entry point. |
|  resType  | *1 ResponseType |  | Default: "json". <br />Can choose from json, text, blob... in Fetch Response. |
| header | *2 SimpleHeader | | Default: *3 DefaultHeader |
| logging | *4 SimpleLogger | | Default Console |

- *1 ResponseType: 
    ```js
        const ResponseTypes = ['json','text','blob','buffer','arrayBuffer'] as const;
        type ResponseType = typeof ResponseTypes[number];
    ```
- *2 SimpleHeader: 
    ```js
    const ContentTypes = ["application/json", "application/x-www-form-urlencoded", "multipart/form-data"] as const;
    interface SimpleHeader extends Record<string,string> {
        "Accept": string;
        "Content-Type": typeof ContentTypes[number];
    };
    ```
- *3 DefaultHeader:
    ```js
    const DEFAULT_HEADER: SimpleHeader = {
        "Accept": "*/*",
        "Content-Type": "application/json"
    };
    ```
- *4 SimpleLogger: 
    ```js
    type SimpleLogger = Pick<Console, 'error' | 'info' >
    ```

### ContentTypes
Flow of Request Body creation (excluding Get)
```js
switch( CONTENT_TYPE ){
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
```


## Example
```js
import ApiClient from "ts-node-fetch-client";

interface ISimpleBook {
    bookId: string;
};
interface IBook {
    bookId: string;
    title: string;
    author: string;
};

const apiClient = new ApiClient({
    baseUri: "https://example.com/api",
    resType: 'json',
    header: {
        "Accept": "*/*",
        "Content-Type": "application/x-www-form-urlencoded"
    }
})

async function run(){
    await apiClient.post<void,Omit<IBook,"bookId">>({
        path: "/books",
        req: { // Typed Omit<IBook,"bookId">
            title: "title",
            author: "author";
        }
    })
    const list = await apiClient.get<ISimpleBook[]>({
        path: "/books",
    })
    for( const l of list ){
        const book = await apiClient.get<IBook>({
            path: "/books/:bookId",
            pathParams: {
                bookId: l.bookId
            },
        })
        const donwload = await apiClient.post<Blob>({
            path: "/books/:bookId/download",
            pathParams: {
                bookId: l.bookId
            },
            resType: 'blob'
        })
        await apiClient.put<IBook,Partial<IBook>>({
            path: "/books/:bookId",
            pathParams: {
                bookId: l.bookId
            },
            req: { // Typed Partial<IBook>
                title: "Next title",
                author: "Next author",
            }
        })
        await apiClient.delete<IBook,Partial<IBook>>({
            path: "/books/:bookId",
            pathParams: {
                bookId: l.bookId
            },
        })
    };
};
```