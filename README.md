# Simple jQuery accordion widget
## Usage
In order the accordion to work it must have certain structure with 4 necessary elements:
```HTML
<ul class="js-accordion" data-singlemode="true"> <!-- Accordion itself -->
	<li class="js-accordion-item collapsed"> <!-- One or more collapsible accordion items -->
		<a href="" class="js-accordion-button">...</a> <!-- Accordion toggle button -->
		<div class="js-accordion-body">...</div> <!-- Collapsible content -->
	</li>
	<li class="js-accordion-item expanded">...</li>
</ul>
```
By default all classes are named like `js-accordion-*`, but you are free to name them whatever you want. You can change them in `Accordion.config` object. `data-singlemode` attribute indicates that only one item can be showed at a time. Also accordions can be nested, i.e. items could contain other accordions.

### `Accordion.config` options

| Property name | Description | Default value |
| --- | --- | --- |
| classAccordion | Class name of accordion | `"js-accordion"` |
| classItem | Class name of item | `"js-accordion-item"` |
| classButton | Class name of toggle button | `"js-accordion-button"` |
| classBody | Class name of body | `"js-accordion-body"` |
| classExpanded | Class name of expanded item | `"expanded"` |
| classCollapsed | Class name of collapsed item | `"collapsed"` |

Also this script brings up with two events: `accordion:beforeToggle` and `accordion:afterToggle` which fire on items. After everything is setup, call call `Accordion.init()` function. That's all!

### Simple script example

```JS
$($e => {
	Accordion.config.classButton = "js-accordion-toggle";
	Accordion.init();
	$("." + Accordion.config.classItem).on("accordion:beforeToggle", $e => console.log("Item before toggling"));
	$("." + Accordion.config.classItem).on("accordion:afterToggle", $e => console.log("Item after toggling"));
});
```
