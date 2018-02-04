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

