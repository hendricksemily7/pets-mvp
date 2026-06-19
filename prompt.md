1. run it
2. pick a pet
3. add a record

We want to make it easy for users to add allergies (eventually vaccines)
right now the way we have it it's free text
we want to allow a user to auto complete existing allergies 
also want users to add in case they're not in our database

The database flexible, and can be added to be user and consumed by the next

Step 1:
Build an API to return all names from the Allergies table - LIMIT?

Step 2: 
Allow UI to retrieve this data and start filtering from it
when new one is entered, we write an allergy record for the pet
