# QuickSongs
An application that will take a popular song (or self made master piece) and create a slide show based on the contents of the song. 

Check it out in action [here](https://qhacks18.firebaseapp.com/)

## Technologies in Play
* The website is created using the latest version of **Angular**.
* Speech is passed through **Watson's Speech to Text API** for a quick translation
* The translated speech is then put through **Microsoft's Text Analytics API** to determine key phrases in the audio file.
* These key phrases are then run through **Microsoft's Bing Image Search API** to find relevant images to build our slideshow
* The results are then streamed to the original webpage and synced with the audio.
* Let the entertainment ensue!

## Requirements
* Node
* Yarn (Could use npm install, but I've only tested with Yarn)
* http-server (installed globally)
* @angular/cli (installed globally)

## Running the Project
After cloning the project, you will need to open 2 terminals. `Anything that looks like this should be run in the terminal`.

### First Terminal (Extra server to deal with cors issues)
1. Navigate to the root directory of the project
2. `yarn install`
3. `node test_server.js`
4. Occassionally you will have to check back to make sure the server is running. Sometimes it crashes because of a bad request.

### Second terminal
1. Navigate to the  "slideshow-generator" folder
2. `yarn install`
3. `ng serve`
4. This will host the server on port 4200. 
5. In a web broswer, go to http://localhost:4200

