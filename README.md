# LibreJargon
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=LibreJargon_LibreJargon&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=LibreJargon_LibreJargon)
### An open-source jargon demystifier.
The aim of this extension is to lower the barriers to entry for research by providing an easy to use interface that will make reading scientific papers easier by automatically defining jargon, providing accessibility/display options, and linking similar articles for further reading. That way, online misinformation (Climate Change, Covid, etc.) can be disproven more easily by the general public.

## Features:
- Built-in PDF viewer
- Automatic jargon highlighting
- Reading list with Suggested Reading
- Highlight a word to get its definition

## Installation Instructions:
- Clone the repo into your folder of choice [git clone https://github.com/LibreJargon/LibreJargon.git]
- Navigate to the created folder [cd LibreJargon]
- Install the necessary packages [npm install]
  - NPM is a prerequisite for this project and can be found here: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm
- Build the project [npm run build]
- Run the extension [npm run ext] or Run tests [npm run test]

## Technical Details
- When clicked, our extension attempts to open the current page as a PDF:

![](README_Pictures/image1.png)
- If successful, the parsed PDF will appear on the left pane:

![](README_Pictures/image2.png)

- And the text from that PDF will appear on the right pane. After selecting text, click the Define Jargon Page to Define that Word upon hovering:

![](README_Pictures/image3.png)
![](README_Pictures/image4.png)

- While the viewer is opened, click the extension button to open the log in page:

![](README_Pictures/image5.png)

- Upon signing up or logging in, your account will be displayed showing you your personal reading list, suggested reading, jargon (jargon here will automatically be defined on web pages), and settings:

![](README_Pictures/image6.png)
