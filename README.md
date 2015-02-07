# jmd

JMD extracts metadata information from data sets in JSON format. You can pass an object, a path to a local file or an URL to a JSON feed. 

###Simple Hashes

Given a simple hash: 

```
{
	key1: 'text',
	key2: 10,
	key3: true,
	key4: undefined,
	key5: new Date(),
	key6: [1,2,3],
	key7: null
}
```
jmd returns a metadata object:

```
{ key1: 'string',
  key2: 'number',
  key3: 'boolean',
  key4: 'undefined',
  key5: 'date',
  key6: 'array',
  key7: 'null'
}
```

###Arrays
TODO

###Local Files
TODO

###URLs
TODO

