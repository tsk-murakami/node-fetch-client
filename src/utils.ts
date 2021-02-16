
const MatchURL = /:(\w+)/g;

export function isObject(value: any) {
    const type = typeof value
    return value != null && (type == 'object' || type == 'function')
};

export function generateRestLikeUrl(url: string, params: Record<string,string|number>){
    const parsed = url.split("/");
    const res = [] as string[];
    for( const p of parsed ){
        const part = p.replace(MatchURL, (match,key) => {
            const value = params[key];
            if( value ) return encodeURIComponent(value)
            return match
        })
        res.push(part)
    };
    return res.join("/")
};