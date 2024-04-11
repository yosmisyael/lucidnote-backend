# User API Specification

## Register User
Endpoint: POST /api/users

Request Body:
```json
{
  "email": "user@example.com",
  "name" : "user"
  "username" : "user",
  "password" : "user1234",
}
```
Response Body (Success):
```json
{
  "data": {
    "username": "user",
    "name": "user"
  }
}
```
Response Body (Failed):
```json
{
  "error": "Username is already taken."
}
```

## Login User
Endpoint: POST /api/users/login

Request Body:
```json
{
  "username" : "user",
  "password" : "user1234",
}
```
Response Body (Success):
```json
{
  "data": {
    "username": "user",
    "name": "user"
  }
}
```
Response Body (Failed):
```json
{
  "error": "Username or password is wrong."
}
```

## Logout User
Endpoint: DELETE /api/users/logout

Request Header:
- X-API-TOKEN: token

Response Body (Success):
```json
{
  "data": "OK"
}
```
Response Body (Failed):
```json
{
  "error": "Unauthorized."
}
```

## Get User
Endpoint: GET /api/users/current

Request Header:
- X-API-TOKEN: token

Response Body (Success):
```json
{
  "data": {
    "username": "user",
    "name": "user"
  }
}
```
Response Body (Failed):
```json
{
  "error": "Unauthorized."
}
```

## Update User
Endpoint: PATCH /api/users/current

Request Header:
- X-API-TOKEN: token

Request Body:
```json
{
  "name" : "user",        // optional
  "username" : "user",    // optional
  "password" : "user1234" // optional
}
```
Response Body (Success):
```json
{
  "data": {
    "username": "user",
    "name": "user"
  }
}
```
Response Body (Failed):
```json
{
  "error": "Unauthorized."
}
```