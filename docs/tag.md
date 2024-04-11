# Tag API Specifications

## Create Tag
Endpoint: POST /api/tags

Header:
- Authorization: token

Request body:
```json
{
  "name": "test"
}
```

Response body success:
```json
{
  "data": {
    "id": "uuid",
    "name": "test"
  }
}
```

Response body error:
```json
{
  "error": "Tag name is already taken."
}
```

## Get All Tag
Endpoint: GET /api/tags/{username}

Header:
- Authorization: token

Response body success:
```json
{
  "data": [
    {
      "name": "name1",
      "id": "tagId1"
    },
    {
      "name": "name2",
      "id": "tagId2"
    },
    {
      "name": "name3",
      "id": "tagId3"
    }
  ]
}
```
Response body error:
```json
{
  "error": "Unauthorized."
}
```

## Update Tag
Endpoint: PUT /api/tags/{tagId}

Header:
- Authorization: token

Request body:
```json
{
  "name": "new name"
}
```

Response body success:
```json
{
  "data": {
    "id": "uuid",
    "name": "new name"
  }
}
```

Response body error:
```json
{
  "error": "Tag does not exist."
}
```

## Delete Tag
Endpoint: DELETE /api/tags/{tagId}

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
  "error": "Unauthorized."
}
```