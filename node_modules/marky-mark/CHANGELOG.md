```
0.2.0: 
	- marked module is now included and used to parse markdown for files with a markdown extension.
	  It is exposed to the end user as markyMark.marked.
	- returned post.markdown will be populated with markdown if file has a markdown extension. 
	  post.content will contain either the html of a processed markdown file, or the file's contents sans yaml.
	- bugfixes (can't readdir a directory)
	- Added to GitHub
	
0.1.2: 
	- returned posts have "content" field as well as "markdown"
	  for now they are the same, but down the road this will change
	- all files in the directory will be loaded into marky-mark, not just markdown
	  This is in preparation for handling .html files as well as markdown files.
	  
0.1.1: Initial Release
```