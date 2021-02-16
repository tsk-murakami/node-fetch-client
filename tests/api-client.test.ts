
import { Server } from "http";

import ApiClient from "../src";

import dummyApp from "./libs/server";
import { PostEntiry, CommentsEntiry } from "./libs/db";

import { generateRestLikeUrl } from "../src/utils"

const client = new ApiClient({
    baseUri: 'http://localhost:4444',
    resType: 'json',
    header: {
        "Content-Type": 'application/x-www-form-urlencoded',
        "Accept": "*/*",
    }
})
let server: Server;
beforeAll( () => {
    server = dummyApp.listen(4444);
    console.log("server listen: 4444")
})
afterAll( () => {
    server.close()
    console.log("Close server listen")
})

describe( "Method get", () => {
    test("Get list", async() => {
        const res = await client.get<PostEntiry[]>({
            path: "/posts"
        })
        expect(res).toEqual( expect.any(Array) )
    })
    test("Get one", async() => {
        const res = await client.get<PostEntiry>({
            path: "/posts/:id",
            pathParams: { id: 1 }
        })
        expect(res).toHaveProperty("id")
        expect(res).toHaveProperty("title")
        expect(res).toHaveProperty("author")
    })
    test("User search query", async() => {
        const nohit = await client.get<PostEntiry,Partial<PostEntiry>>({
            path: "/posts",
            req: { title: 'hoge' }
        })
        expect(nohit).toHaveLength(0)
        const idHit = await client.get<PostEntiry,Partial<PostEntiry>>({
            path: "/posts",
            req: { id: '1' }
        })
        expect(idHit).toHaveLength(1)
    })
    test("Response to text", async() => {
        const stringfied = await client.get<string>({
            path: "/posts",
            resType: 'text',
        })
        expect(stringfied).toEqual( expect.any(String) )
    })
    test("Response to blob", async() => {
        const blobd = await client.get<Blob>({
            path: "/posts",
            resType: 'blob',
        })
        expect(blobd.type).toEqual( expect.stringContaining("application/json") )
        const text = await blobd.text()
        expect(text).toEqual( expect.any(String) )
    })
    test("Response to buffer", async() => {
        const buffered = await client.get<Buffer>({
            path: "/posts",
            resType: 'buffer',
        })
        const text = buffered.toString();
        const json = buffered.toJSON();
        expect(buffered).toEqual( expect.any(Buffer) )
        expect(text).toEqual( expect.any(String) )
        expect(json.type).toEqual("Buffer")
    })
    test("Response to array buffer", async() => {
        const buffered = await client.get<ArrayBuffer>({
            path: "/posts",
            resType: 'arrayBuffer',
        })
        const text = buffered.toString();
        expect(buffered).toEqual( expect.any(ArrayBuffer) )
        expect(text).toEqual( expect.any(String) )
    })
} )

describe( "Method post", () => {
    test("Post", async() => {
        const newItem = {
            id: "2",
            title: 'NEW Title',
            author: 'Dummy creator'
        }
        const res = await client.post<PostEntiry,PostEntiry>({
            path: "/posts",
            req: newItem
        })
        expect(res).toEqual(newItem)
        const list = await client.get<PostEntiry[]>({
            path: "/posts",
        })
        expect(list).toHaveLength(2)
    })
} )

describe( "Method put", () => {
    test("Put", async() => {
        const updatedItem = {
            id: "2",
            title: 'Update',
            author: 'Update'
        }
        const res = await client.put<PostEntiry,PostEntiry>({
            path: "/posts/:id",
            pathParams: {
                id: 2
            },
            req: updatedItem
        })
        expect(res).toEqual(updatedItem)
        const list = await client.get<PostEntiry[]>({
            path: "/posts",
        })
        expect(list).toHaveLength(2)
    })
} )


describe( "Method delete", () => {
    test("Delete", async() => {
        await client.delete<PostEntiry,PostEntiry>({
            path: "/posts/2",
        })
        const list = await client.get<PostEntiry[]>({
            path: "/posts",
        })
        expect(list).toHaveLength(1)
    })
} )

describe( "Utils", () => {
    test("Simple", () => {
        const newUrl = generateRestLikeUrl("/:resource/hoge", { resource: "1234" } )
        expect(newUrl).toEqual("/1234/hoge")
    })
    test("Multi", () => {
        const newUrl = generateRestLikeUrl("/:id1/hoge/:id2", { id1: "1234", id2: "2345" } )
        expect(newUrl).toEqual("/1234/hoge/2345")
    })
    test("Not have paramter", () => {
        const newUrl = generateRestLikeUrl("/:id1/hoge/:id2", { id1: "1234" } )
        expect(newUrl).toEqual("/1234/hoge/:id2")
    })
})