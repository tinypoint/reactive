import {styleTags, tags} from "@lezer/highlight"

export const highlighting = styleTags({
  Number: tags.number,
  String: tags.string,
  MyExpression: tags.content,
})