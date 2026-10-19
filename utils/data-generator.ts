import fs from 'fs'
import { faker } from '@faker-js/faker'

const email = faker.internet.email()
const password = "helloWorld01@"

export function generateUserRegistrationPayload()
{
    const userRegistrationPayload = JSON.parse(fs.readFileSync('./request-objects/POST-registration.json', 'utf-8'))
    const userRegistrationBody = structuredClone(userRegistrationPayload)
    userRegistrationBody.email = email
    userRegistrationBody.password = password
    return userRegistrationBody
}

export function generateUserLoginPayload()
{
    const userLoginPayload = JSON.parse(fs.readFileSync('./request-objects/POST-registration.json', 'utf-8'))
    const userLoginBody = structuredClone(userLoginPayload)
    userLoginBody.email = email
    userLoginBody.password = password
    return userLoginBody
}

export function addToCartPayload()
{
    const itemInCartPayload = JSON.parse(fs.readFileSync('./request-objects/POST-addToCart.json', 'utf-8'))
    const itemInCartBody = structuredClone(itemInCartPayload)
    return itemInCartBody
}

