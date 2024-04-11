# Note API Specifications

## Create Note
Endpoint: POST /api/notes

Header:
- Authorization: token

Request body:

```json
{
  "data": {
    "title": "My Note",
    "body": "This is my first note.",
    "tags": [
      {
        "id": "uuid"
      },
      {
        "id": "uuid"
      }
    ]
  }
}
```
Response body success:

```json
{
  "data": {
    "id": "uuid",
    "title": "My Note",
    "body": "This is my first note.",
    "createdAt": "YYYY-MM-DD hh:mm:ss",
    "updatedAt": "YYYY-MM-DD hh:mm:ss",
    "tags": [
      {
        "id": "uuid",
        "name": "example tag 1"
      },
      {
        "id": "uuid",
        "name": "example tag 2"
      }
    ]
  }
}
```
Response body error:
```json
{
  "error": "Title is required."
}
```
## Update Note
Endpoint: PUT /api/notes/{noteId}

Header:
- Authorization: token

Request body:

```json
{
  "title": "My New Title",
  "body": "I just updated my note.",
  "tags": [
    {
      "id": "uuid"
    }
  ]
}
```
Response body success:

```json
{
  "data": {
    "id": "unique-id",
    "title": "My New Title",
    "body": "I just updated my note.",
    "createdAt": "YYYY-MM-DD hh:mm:ss",
    "updatedAt": "YYYY-MM-DD hh:mm:ss",
    "tags": [
      {
        "id": "uuid"
      }
    ]
  }
}
```
Response body error:
```json
{
  "error": "Tag must be valid."
}
```

## Get Note
Endpoint: GET /api/notes/{noteId}

Header:
- Authorization: token

Response body success:
```json
{
  "id": "unique-id",
  "title": "My New Title",
  "body": "I just updated my note.",
  "createdAt": "YYYY-MM-DD hh:mm:ss",
  "updatedAt": "YYYY-MM-DD hh:mm:ss"
}
```
Response body error:
```json
{
  "error": "Note does not exist."
}
```

## Delete Note
Endpoint: DELETE /api/notes/{noteId}

Header:
- Authorization: token

Response body success:
```json
{
  "data": "OK"
}
```
Response body error:
```json
{
  "error": "Note does not exist."
}
```

## Search Note
Endpoint: GET /api/notes

Header:
- Authorization: token

Query Params:
- title: search by title
- page: number of page, default 1
- size: size per page, default 10,
- tags: array of tag ids

Response body success:
```json
{
  "data": [
    {
      "id": "unique-id",
      "title": "first note",
      "body": "example body",
      "createdAt": "YYYY-MM-DD hh:mm:ss",
      "updatedAt": "YYYY-MM-DD hh:mm:ss",
      "tags": []
    }, 
    {
      "id": "unique-id",
      "title": "second note",
      "body": "example body",
      "createdAt": "YYYY-MM-DD hh:mm:ss",
      "updatedAt": "YYYY-MM-DD hh:mm:ss",
      "tags": [
        {
          "id": "uuid"
        }
      ]
    } 
  ],
  "paging": {
    "size": 2,
    "totalPage": 3,
    "currentPage": 1
  }
}
```