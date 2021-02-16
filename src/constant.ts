
import { SimpleHeader, ResponseType } from "./data-models";

const jsonMimeType = "application/json";

export const DEFAULT_HEADER: SimpleHeader = {
    "Accept": "*/*",
    "Content-Type": jsonMimeType
};

export const DEFAULT_RESPONSE_TYPE: ResponseType = 'json';
