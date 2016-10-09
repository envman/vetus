# History
As with most of the features built on git we want to add a more object based approach, git will give us the history of lines not the history of each property in the object graph

## Possible Approaches
- Reverse the line history back to the object? (Not sure how/if possible)
- Store our own history in a separate graph that is versioned along side the data

e.g. in directory
obj.json
obj.hist.json

Basic idea we generate the history each time a object is saved
