import $ from "jquery";

const CLASS_ACCORDION = "jq-accordion";
const CLASS_ITEM = "jq-accordion-item";
const CLASS_BUTTON = "jq-accordion-button";
const CLASS_BODY = "jq-accordion-body";
const CLASS_EXPANDED = "expanded";
const CLASS_COLLAPSED = "collapsed";
// const CLASS_TOGGLING = "toggling"; TODO

$.fn.accordion = function (this: JQuery<HTMLElement>) {
	toggleBodiesVisibility();
	this.delegate("." + CLASS_BUTTON, "click", onButtonClick);
}

function onButtonClick(this: HTMLElement, e: any) {
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

	export function getMode(element: HTMLElement): Mode {
		return element.getAttribute("data-mode") as Mode || "single";
	}

	export function getExpandedItem(accordion: HTMLElement): HTMLElement | null {
		const items = $(accordion).find("." + CLASS_ITEM).toArray();
		const depths = items.map(item => $(item).parents().length);
		const lowestDepth = Math.min.apply(null, depths);
		for (const i in items) {
			const $item = $(items[i]);
			if ($item.parents().length === lowestDepth && $item.hasClass(CLASS_EXPANDED))
				return $item[0];
		}
		return null;
	}
}

namespace Item {

	export function getAccordion(item: HTMLElement): HTMLElement | null {
		const $accordion = $(item).closest("." + CLASS_ACCORDION);
		return $accordion.length ? $accordion[0] : null;
	}

	export function getBody(item: HTMLElement): HTMLElement | null {
		const bodies = $(item).find("." + CLASS_BODY).toArray();
		if (!bodies.length)
			return null;
		let $body = $(bodies[0]);
		for (var i = 1; i < bodies.length; i++) {
			var $tmpBody = $(bodies[i]);
			if ($tmpBody.parents().length < $body.parents().length)
				$body = $tmpBody;
		}
		return $body[0];
	}

	export function toggle(element: HTMLElement): void {
		if (isToggling(element))
			return;
		const $element = $(element);
		$element.trigger("accordion:beforeToggle");
		$(getBody(element)!).slideToggle();
		const accordion = getAccordion(element)!;
		if (Accordion.getMode(accordion) === "single" && !isExpanded(element)) {
			const expandedItem = Accordion.getExpandedItem(element);
			if (expandedItem) {
				$(expandedItem).removeClass(CLASS_EXPANDED).addClass(CLASS_COLLAPSED);
				$(getBody(expandedItem)!).slideUp();
			}
		}
		$element.toggleClass(CLASS_COLLAPSED).toggleClass(CLASS_EXPANDED);
		$element.trigger("accordion:afterToggle");
	}

	export function isToggling(element: HTMLElement): boolean {
		return $(getBody(element)!).is(":animated");
	}

	export function isExpanded(element: HTMLElement): boolean {
		return $(element).hasClass(CLASS_EXPANDED);
	}
}

namespace Button {
	
	export function getItem(element: HTMLElement): HTMLElement {
		const $item = $(element).closest("." + CLASS_ITEM);
		if (!$item.length)
			throw new Error("There is no item for this button");
		return $item[0];
	}
}

declare global {
	interface JQuery {
		accordion(this: JQuery<HTMLElement>): void;
	}
}

type Mode = "single" | "multiple";
