# COMP3000-Project
Final year project for COMP3000

Extended project description

For this project, I will develop an android application that will use a phones front facing camera to track a pen stylus on a desk and recognise the characters being written. 
The system would have to detect when the stylus is down, when a character has finished being written, and when a new character is being started.

A possible extension of the application could also be to detect when the user wishes to erase the previous text, either by detecting when the stylus has been turned over, or when the user scribbles something out. A more favourable potential would be to implement a form of artificial intelligence such as Classification or Neural Network to identify the characters written. 


To do this, the live camera feed from the front facing camera will be used as the input image for the various algorithms. The application will need to be able to extract or locate the nib of the stylus and use motion tracking techniques to calculate the changes in x and y positions of the nib. 

By repeating this process over multiple frames, a sequence of coordinates can be obtained, from which a separate algorithm will be used to recognise the character written. This algorithm could be a machine learning algorithm. 

The application would need to be able to work in real time. Assuming the standard front-facing camera has a frame rate of 30fps, the application would have less than 30ms to perform all the object recognition calculations. 

To test and provide feedback to the user, the application needs to display back to the user the live camera feed but showing the calculated position of the nib. It would also need to display to the user a sort of “dot-to-dot” of the estimated position of the nib as a 2D projection, to allow the user to see what they would have written.
