import fs from 'fs/promises'
import Ajv from "ajv"
import path from "path"

const SCHEMA_BASE_PATH = "./response-schemas/"
const ajv = new Ajv({allErrors:true})

export async function validateSchema(responseBody:object, jsonSchemaFileName:string)
{
    const schemaPath = path.join(SCHEMA_BASE_PATH, jsonSchemaFileName)
    const schema = await loadSchema(schemaPath)
    const validate = ajv.compile(schema)
    const valid = validate(responseBody)
    if(!valid)
    {
        throw new Error(`Schema validation failed for file: ${schemaPath}`)
    }

}

async function loadSchema(schemaPath:string)
{
    try{
        const schemaContent = await fs.readFile(schemaPath, 'utf-8')
        return JSON.parse(schemaContent)
    }
    catch (error){
        throw new Error(`Failed to load schema file: ${schemaPath}: ${(error as Error).message}`)
    }
}