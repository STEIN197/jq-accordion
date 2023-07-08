import $ from "jquery";

// TODO: Add options ({duration: number;})
const MODE_DEFAULT: Mode = "single";
const CLASS_ACCORDION = "jq-accordion";
const CLASS_ITEM = "jq-accordion-item";
const CLASS_BUTTON = "jq-accordion-button";
const CLASS_BODY = "jq-accordion-body";
const CLASS_EXPANDED = "expanded";
const CLASS_COLLAPSED = "collapsed";
const CLASS_TOGGLING = "toggling";

$.fn.accordion = function (this: JQuery<HTMLElement>) {
	toggleBodiesVisibility();
	this.delegate("." + CLASS_BUTTON, "click", onButtonClick);
}

function onButtonClick(this: JQuery<HTMLElement>, e: any) {
	e.preventDefault();
	Item.toggle(Button.getItem(this));
}

function toggleBodiesVisibility(): void {
	$("." + CLASS_BODY).each(function () {
		const $body = $(this);
		const $item = $body.closest("." + CLASS_ITEM);
		if ($item.hasClass(CLASS_EXPANDED))
			$body.slideDown();
		if ($item.hasClass(CLASS_COLLAPSED))
			$body.slideUp();
	});
}

namespace Accordion {

	export function getMode($element: JQuery<HTMLElement>): Mode {
		return $element.attr("data-mode") as Mode || MODE_DEFAULT;
	}

	export function getExpandedItem($accordion: JQuery<HTMLElement>): JQuery<HTMLElement> | null {
		const items = $accordion.find("." + CLASS_ITEM).toArray();
		const depths = items.map(item => $(item).parents().length);
		const lowestDepth = Math.min(...depths);
		for (const item of items) {
			const $item = $(item);
			if ($item.parents().length === lowestDepth && $item.hasClass(CLASS_EXPANDED))
				return $item;
		}
		return null;
	}
}

namespace Item {

	export function getAccordion($item: JQuery<HTMLElement>): JQuery<HTMLElement> | null {
		const $accordion = $item.closest("." + CLASS_ACCORDION);
		return $accordion.length ? $accordion : null;
	}

	export function getBody($item: JQuery<HTMLElement>): JQuery<HTMLElement> | null {
		const bodies = $item.find("." + CLASS_BODY).toArray();
		if (!bodies.length)
			return null;
		let $body = $(bodies[0]);
		for (var i = 1; i < bodies.length; i++) {
			const $tmpBody = $(bodies[i]);
			if ($tmpBody.parents().length < $body.parents().length)
				$body = $tmpBody;
		}
		return $body;
	}

	export function toggle($element: JQuery<HTMLElement>): void {
		if (isToggling($element))
			return;
		$element.trigger("accordion:beforeToggle");
		const $body = getBody($element);
		if (!$body)
			throw new Error("There is no body in the item");
		$body.slideToggle(400, onSlideComplete);
		const $accordion = getAccordion($element);
		if (!$accordion)
			throw new Error("There is no accordion for the item");
		if (Accordion.getMode($accordion) === "single" && !isExpanded($element)) {
			const $expandedItem = Accordion.getExpandedItem($element);
			if ($expandedItem) {
				$expandedItem.removeClass(CLASS_EXPANDED).addClass(CLASS_COLLAPSED);
				const $expandedBody = getBody($expandedItem);
				if (!$expandedBody)
					throw new Error("There is no body in the expanded item");
				$expandedBody.slideUp(400, onSlideComplete);
			}
		}
		$element.toggleClass(CLASS_COLLAPSED).toggleClass(CLASS_EXPANDED);
		$element.trigger("accordion:afterToggle"); // TODO: Trigger on slide complete
	}

	export function isToggling($element: JQuery<HTMLElement>): boolean {
		const $body = getBody($element);
		if (!$body)
			throw new Error("There is no body in the item");
		return $body.hasClass(CLASS_TOGGLING);
	}

	export function isExpanded($element: JQuery<HTMLElement>): boolean {
		return $element.hasClass(CLASS_EXPANDED);
	}

	function onSlideComplete(this: HTMLElement): void {
		$(this).toggleClass(CLASS_TOGGLING); // TODO: Add class to an item, not to a body
	}
}

namespace Button {
	
	export function getItem($element: JQuery<HTMLElement>): JQuery<HTMLElement> {
		return $element.closest("." + CLASS_ITEM);
	}
}

declare global {
	interface JQuery {
		accordion(this: JQuery<HTMLElement>): void;
	}
}

type Mode = "single" | "multiple";
