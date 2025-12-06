# Appointments micro service
This appointments micro service is part of larger whole, the veterinarian application. Other micro services in this application are:
1. API Gateway (not implemented at this moment)
2. Client information (not implemented at this moment)

## Usage

We will be using a `/api/v1/` base url.

The following routes are implemented
|method|resource|description|
|-|-|-|
|GET|`/appointments/`|all the appointments in the database for the current year|
|POST|`/appointments/`|post a new apppointment; appointment not added to the db|
|GET|`/appointments/:id`|a specific appointment|
|GET|`/timeslots`|all the available timeslots|
|GET|`/timeslots/:id`|a specific timeslot|
|GET|`/dates/`|all the dates of the year|
|GET|`/dates/id`|a specific date|

## Querystrings

We are using this `appointments?day=9` query string option to get appointments for a specific date. Mind you, we distinguish 365 days.

## JSON 

For every request the following response is given

```json
"meta":{
    "count": 16,
    "title": "title of the request",
    "url": "original url of the requests"
},
"data": [
    "route-to-individual item"
]

```