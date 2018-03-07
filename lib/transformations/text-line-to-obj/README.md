# Convert a CSV line to a JavaScript object

Using RFC 4180 CSV definition

```
Configuration example:
{
    "Name": "TEXT_LINE_TO_OBJ",
    "attributeNames": "<list of CSV headers>",
    "delimiter": ",",
    "textQualifier": "\"",
    "escapeChar": "\\",
    "afterTaskRunCBs": []
}
```