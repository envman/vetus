# diff
We should be able to diff two points in time

- How would this manifest
- Something similar should be used for merge resolution

## partial graph diff

{
  obj: {
    sub: {
      arr: [
        'hello'
      ]
    }
  }
}

query { obj: {sub : arr: {}} }
- this should specify part of graph to diff? (something like this)
- basically we want to diff the array
- would we specify with gittish style e.g. HEAD~1 or just two commits?
- currently don't expose comit #'s
