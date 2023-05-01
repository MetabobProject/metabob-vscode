​![metabob-logo](docs/img/docs-metabob-logo.png)
​
# Metabob​

This extension allows you to analyze Python code using a graph-attention-based neural network to detect and classify problematic code, and generate descriptions and code recommendations for the detected problems using an LLM of your choice. 
​
Supercharge your coding with AI-powered code reviews! Automatically detect complex logical and contextual problems such as unhandled edgecases, memory leaks, and hundreds of other categories using Metabob’s proprietary neural network. Additionally, you can generate code recommendations for fixes and refactorings as well as ask questions about detections using an integrated LLM of your choice! 
​
Out of the box, Metabob uses a tuned version of Meta AI's OPT model to generate problem descriptions and code recommendations to fixes and refactorings. If you’d like to change the integrated LLM, just go to the settings and input an api key to switch to using your preferred LLM. 
​
# Features
* :mag: Automatically detect and classify problems. 
* :eyes: View problem descriptions to understand the detected problems
* :question: Ask questions about the problem descriptions and pass in more context about your code to generate more accurate problem descriptions
* :hammer_and_wrench: Generate code recommendations to fix the detected problems
* :question: Ask questions about the code recommendations and/or pass in more context about your code ro generate more context-sensitive code recommendations if needed
​​
# Settings​

* To disable Metabob anlaysis from running every time code is saved, go to the extension settings and deselect the checkbox under the text "Metabob: **Analyze Document On Save**"  
![](docs/img/docs-analyze-on-save.png)
​
* To change the backend LLM model Metabob uses to generate problem descriptions and code recommendations, select your preferred model from the "Metabob: **Backend Selection**" drop down menu  
![](docs/img/docs-backend-selection.png)
​
* If you prefer to use one of the openai models, you need to authenticate by inputting your openai API key into the text field under "Metabob: ChatGPT Token" text field on Metabob's extension settings  
![](docs/img/docs-openai-token.png)

# Usage​
​
1. Request an analysis by either saving the file (Metabob by default performs an analysis when a file is saved, this can be changed in settings) or by opening the command palette and choosing **_"Metabob: Analyze Document"_**  
![analyze-document](docs/img/docs-analyze-document.png)
​
2. Once the analysis is running, you can see a loading icon with a text "Metabob: Analyzing Document" on the bottom bar of VScode​  
![loading-message](docs/img/docs-loading.png)
​
3. Once the analysis has completed, you can see problematic code regions highlighted in red  
![red-highlight](docs/img/docs-red-highlight.png)
​
4. Hover over the highlighted area to open Metabob's pop-up box with problem category, short description of the problem, and commands **_"Fix"_** and **_"More Details"_**  
![problem-pop-up](docs/img/docs-pop-up.png)
​
5. On the pop-up box, click **_"Fix"_** to open Metabob's extension panel to view more details about the problem and automatically generate a code recommendation for a fix **OR** click **_"More Details"_** to open the extension panel to just view more details about the problem  
![problem-pop-up-commands](docs/img/docs-popup-commands.png)
​
6. You can **_"discard"_** the problem if you think it is invalid or unuseful. You can **_"endorse"_** the problem if you think it is valid or useful  
![discard-or-endorse](docs/img/docs-discard-endorse.png)
​
7. Ask questions about the problem description or pass in more context by using the text field below the problem description and clicking **_"ask"_** after  
![problem-ask-question](docs/img/docs-probquestion.png)
​
8. After passing in more context, you can regenerate the problem description by clicking **_"regenerate"_**  
![regenerate-description](docs/img/docs-desc-regenerate.png)
​
9. You can generate a code recommendation for a fix by clicking **_"generate"_** on the right side from **"Recommendation"**  
![generate-recommendation](docs/img/docs-coderec-generate.png)
​
10. You can apply the code recommendation to your code by clicking **_"apply'_**  
![apply-recommendation](docs/img/docs-coderec-apply.png)
​
11. You can ask questions and pass in more context for the code recommendation by using the text field below and clicking **_"ask"_**  
![update-recommendation](docs/img/docs-coderec-ask.png)
​
12. After passing in more context and asking questions, you can regenerate the code recommendation by clicking **_"regenerate"_**  
![regenerate-recommendation](docs/img/docs-coderec-regenerate.png)

# Data Policy
​
Metabob deletes all data from it's problem detection model one hour after the user has made their last API call. However, as Metabob integrates with third party LLMs to generate problem descriptions and code recommendations to perform fixes, Metabob has to pass data to these models and cannot control how the data is used by the companies hosting these LLMs. ​
​