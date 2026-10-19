import { APIRequestContext, test } from "@playwright/test";
import { Url } from "node:url";

export class RequestHandler{
    private request: APIRequestContext 
    private baseURL: string | undefined
    private apiBaseUrl: string
    private apiPath: string = ''
    private queryParams: object = {}
    private apiHeaders: Record<string,string> = {}
    private apiBody: object = {}

    constructor(request: APIRequestContext, apiBaseUrl:string)
    {
        this.request = request
        this.apiBaseUrl = apiBaseUrl
        //console.log(apiBaseUrl)
    }

    //Builder Pattern / Fluent pattern
    /*
    const request = new RequestHandler('dummy request', 'dummy url')
    request.url('url')
    request.path('path')
    request.url('url').path('path') -> Method Chaining
    */

    url(baseUrl:string)
    {
        this.baseURL = baseUrl
        return this
    }

    path(apiPath:string)
    {
        this.apiPath = apiPath
        //console.log(apiPath)
        return this
    }

    params(queryParams:object)
    {
        this.queryParams = queryParams
        return this
    }

    headers(apiHeaders: Record<string, string>)
    {
        this.apiHeaders = apiHeaders
        return this
    }

    body(apiBody: object)
    {
        this.apiBody = apiBody
        return this
    }

    async getRequest()
    {
        let response: any
        const fullUrl = `${this.apiBaseUrl}${this.apiPath}`
        await test.step(`GET request to: ${fullUrl}`, async()=> {
            response = await this.request.get(fullUrl,
                {
                    headers: this.apiHeaders,
                    params: this.queryParams as {[key:string]: string | number | boolean}
                })
            })
        return response
    }

    async postRequest()
    {
        let response: any
        const fullUrl = `${this.apiBaseUrl}${this.apiPath}`
        console.log(fullUrl)
        await test.step(`POST request to: ${fullUrl}`, async()=> {
            response = await this.request.post(fullUrl,
                {
                    data: this.apiBody,
                    headers: this.apiHeaders,
                    //params: this.queryParams as {[key:string]: string | number | boolean}
                })
                this.cleanup()
            })
        return response
    }

    private cleanup()
    {
        test.step('cleanup', async()=>{
            this.apiBody = {}
            this.apiHeaders = {}
            this.apiPath = ""
            this.queryParams = {}
        })
    }

    
}