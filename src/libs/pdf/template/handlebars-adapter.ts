import Handlebars from "handlebars";

Handlebars.registerHelper("row", function (base, index, amount) {
  return base + index * amount;
});

Handlebars.registerHelper("sum", function (a, b) {
  return a + b;
});

export { Handlebars };
