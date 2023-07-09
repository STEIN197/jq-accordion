import * as $ from "jquery";

// TODO: Add options ({duration: number;})
const MODE_DEFAULT: Mode = "single";
const SLIDE_DURATION_DEFAULT = 400;
const CLASS_ACCORDION = "jq-accordion";
const CLASS_ITEM = "jq-accordion-item";
const CLASS_BUTTON = "jq-accordion-button";
const CLASS_BODY = "jq-accordion-body";
const CLASS_EXPANDED = "expanded";
const CLASS_COLLAPSED = "collapsed";
const CLASS_TOGGLING = "toggling";
const EVENT_TOGGLE_BEFORE = "accordion.toggle.before";
const EVENT_TOGGLE_AFTER = "accordion.toggle.after";

$.fn.accordion = function (this: JQuery<HTMLElement>) {
	toggleBodiesVisibility();
	this.delegate("." + CLASS_BUTTON, "click", onButtonClick);
}

function onButtonClick(this: JQuery<HTMLElement>, e: any) {
	e.preventDefault();
	const $item = getItem(this);
	if (!$item)
		throw new Error("There is no item for the button");
	Item.toggle($item);
}

function toggleBodiesVisibility(): void {
	$("." + CLASS_ITEM).each(function () {
		const $this = $(this);
		const $body = Item.getBody($this);
		if (!$body)
			return;
		if ($this.hasClass(CLASS_EXPANDED))
			$body.slideDown();
		if ($this.hasClass(CLASS_COLLAPSED))
			$body.slideUp();
	});
}

function getItem($element: JQuery<HTMLElement>): JQuery<HTMLElement> | null {
	return getClosestByClassName($element, CLASS_ITEM);
}

function getAccordion($element: JQuery<HTMLElement>): JQuery<HTMLElement> | null {
	return getClosestByClassName($element, CLASS_ACCORDION);
}

function getClosestByClassName($element: JQuery<HTMLElement>, className: string): JQuery<HTMLElement> | null {
	const $closest = $element.closest("." + className);
	return $closest.length ? $closest : null;
}

namespace Accordion {

	export function getMode($element: JQuery<HTMLElement>): Mode {
		return $element.attr("data-mode") as Mode || MODE_DEFAULT;
	}

	export function getExpandedItems($accordion: JQuery<HTMLElement>): JQuery<HTMLElement>[] {
		const items = getItems($accordion);
		return items.filter($item => $item.hasClass(CLASS_EXPANDED));
	}

	function getItems($accordion: JQuery<HTMLElement>): JQuery<HTMLElement>[] {
		const items = $accordion.find("." + CLASS_ITEM).toArray().map(item => {
			const $item = $(item);
			return [$item, $item.parents().length] as [item: JQuery<HTMLElement>, depth: number];
		});
		const lowestDepth = Math.min(...items.map(entry => entry[1]));
		const result: JQuery<HTMLElement>[] = [];
		for (const [$item, depth] of items) {
			if (depth === lowestDepth)
				result.push($item);
		}
		return result;
	}
}

namespace Item {

	export function getBody($item: JQuery<HTMLElement>): JQuery<HTMLElement> | null {
		const bodies = $item.find("." + CLASS_BODY).toArray().map(item => {
			const $item = $(item);
			return [$item, $item.parents().length] as [item: JQuery<HTMLElement>, depth: number];
		});
		if (!bodies.length)
			return null;
		const bodyEntry = bodies.reduce((prev, cur) => cur[1] < prev[1] ? cur : prev, [null as unknown as JQuery<HTMLElement>, Infinity]);
		return bodyEntry[0];
	}

	export function toggle($element: JQuery<HTMLElement>): void {
		if (isToggling($element))
			return;
		$element.trigger(EVENT_TOGGLE_BEFORE);
		const $body = getBody($element);
		if (!$body)
			throw new Error("There is no body in the item");
		$body.slideToggle(SLIDE_DURATION_DEFAULT, Body.onSlideComplete);
		const $accordion = getAccordion($element);
		if (!$accordion)
			throw new Error("There is no accordion for the item");
		if (Accordion.getMode($accordion) === "single" && !isExpanded($element)) {
			const $items = Accordion.getExpandedItems($element);
			for (const $expandedItem of $items) {
				$expandedItem.removeClass(CLASS_EXPANDED).addClass(CLASS_COLLAPSED);
				const $expandedBody = getBody($expandedItem);
				if (!$expandedBody)
					throw new Error("There is no body in the expanded item");
				$expandedBody.slideUp(SLIDE_DURATION_DEFAULT, Body.onSlideComplete);
			}
		}
		$element.toggleClass(CLASS_COLLAPSED).toggleClass(CLASS_EXPANDED);
	}

	export function isToggling($item: JQuery<HTMLElement>): boolean {
		return $item.hasClass(CLASS_TOGGLING);
	}

	export function isExpanded($element: JQuery<HTMLElement>): boolean {
		return $element.hasClass(CLASS_EXPANDED);
	}
}

namespace Body {

	export function onSlideComplete(this: HTMLElement): void {
		const $this = $(this);
		const $item = getItem($this);
		if (!$item)
			throw new Error("There is no item for the body");
		$item.toggleClass(CLASS_TOGGLING).trigger(EVENT_TOGGLE_AFTER);
	}
}

declare global {
	interface JQuery {

		/**
		 * Create accordions inside the selected container.
		 * @example
		 * ```html
		 * <ul class="jq-accordion" data-mode="multiple">
		 * 	<li class="jq-accordion-item collapsed">
		 * 		<button class="jq-accordion-button">Toggle</button>
		 * 		<div class="jq-accordion-body">...</div>
		 * 	</li>
		 * 	<li class="jq-accordion-item expanded">
		 * 		<button class="jq-accordion-button">Toggle</button>
		 * 		<div class="jq-accordion-body">...</div>
		 * 	</li>
		 * </ul>
		 * <script>
		 * 	$(body).accordion();
		 * 	$(".jq-accordion-item").on("accordion.toggle.before", () => console.log("An item is toggling"));
		 * 	$(".jq-accordion-item").on("accordion.toggle.after", () => console.log("An item has just been toggled"));
		 * </script>
		 * ```
		 */
		// TODO: Tests
		accordion(this: JQuery<HTMLElement>): void;
	}
}

type Mode = "single" | "multiple";
