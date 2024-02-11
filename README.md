Crud API is an app that creates, reads, updates and deletes users in in-memory database.
To use this program you will need some api platform, for example "postman"

1. Type "npm i" in you terminal to install all the dependences listed in the package.json file;
2. The app can run using environmental variables. To do so, rename the file ".env.expamle" to ".env";
   By default the app uses 4000 Port.
3. Type 'npm run start:dev' in the terminal to run the app in development mode (using nodemon and ts-node).
   Perform api request using your api platform in the following way:
   - make a GET request on address "localhost:4000/api/users" - should initially return an empty array;
   - make a POST request on address "localhost:4000/api/users" with a JSON body, that should contain username:string, age:number and hobbies:string[] parameters, for example:
     {
     "username": "some name",
     "hobbies": ["some hobbie"],
     "age": 55
     }.
     It will create add the user to the database and return a newly created user. Copy the id (without the quotes) of the returned user; It should look something like this: 9fb9a9d4-cce0-4fca-8468-9e5df52f9330;
   - make a GET request on address "localhost:4000/api/user/put-copied-id-here" (change the put-copied-id-here with the it you've just copied. It should look something like this:
     localhost:4000/api/user/9fb9a9d4-cce0-4fca-8468-9e5df52f9330). This should return a user that you created on the previous step;
   - make a PUT request on address "localhost:4000/api/user/put-copied-id-here" with a JSON body, with some parameters that you would like to change, for example:
     {
     "username": "updated name"
     }
     This will update the created user and return it's updated version;
   - make a DELETE request on address "localhost:4000/api/user/put-copied-id-here"; This will return nothing, except for the operation code 204, and your user by now is removed from your database;
     To exit use "ctrl+c" in your terminal;
4. Type 'npm run start:prod' in the terminal to run the app in production mode. This command will create a
   "build"directory and then run the compiled to the javascript version of the program;
   It will work in exactly the same way as in development mode;
   To exit use "ctrl+c" in your terminal;
5. Type 'npm run start:multi' in the terminal to run the app using cluster. This command will run
   the load_balancer.ts, creating several servers with shared state. This mode shall work in the same way
   as development mode, but requests would be sent to different ports.
   To test that this mode is working correctly
   keep an eye on the terminal - it will produce logs.
   To exit use "ctrl+c" in your terminal;
6. Type "npm run test" to test the app with the tests from src/index.spec.ts file;
