fix day status of meals to reflect the states of the meals, status should include :"not started", "work in progress", "inventory needed", "ready", "preparing", "serving", "completed", "skipped".  work in progress is that there are not enough recipes for the meal to balance it and completed is that the meal has been executed, skipped is a past meal that was never executed.  ensure the wiring of teh alert status on the meal plan page and the dashboard status button indivction are wired to this status.
meals should have a planned start prep time, planned end prep time, planned start serve time, planned end serve time.  the execute should be able to help specify what state is being executed.
in the recipe cards on the meal plan page, the focus of the card is the name of the recipe, this should be large enough to read, provide a better hover over effect and move teh neagive action buttons appropriately to teh bottom of the card, balanced for easy user understanding and action flow in regaurds to teh other buttones that are alow at the bottom of the card.
the resolve meal issues, should be for all recipes in the meal at the same time and also identify the recipe that the issue comes from.  if there is a unit discrepancy for an ingredient the conversion rule like what is on the inventory page should be made availble here and posted to the inventory page for all conversion rules in one place.  the conversion rule does not need to stay on the recipe or meal card, only the element that caused the discrepancy should not longer have an alert status.

once items have been added to the shopping list the shortage shold still be shown on the card, but the button to add them if the total of all the same ingredient for all recipes is suffient then the add to shopping card buton should not be available.  the amount should reflect the amount of teh shortage for this recipe, if teh shortage for all recipes is resolve in another recipe the resolution should be effective of all recipes, if there is enough to satisfy all fo them in the stock + shopping list.


reduce session storage data load and local storage data load, do not duplicate, use memory cache where applicable to reduce api calls.




the effect inthe recipe instructions is hard to read with the underline, try changing to italics instead.
the shopping list dashboard should have a select all checkbox following the customary actions of this type of control on that dashboard.  also if nothing is selected the purchase seleted should be deactivated and subdued to a diff color in the theme.
the low stock dashboard, should have an add all button at the bottom of the card - centered.
add a item to the shopping directly similar to the add inventory item.
when i edited the inventory stock aned change the value the display did not update to reflecty the new quantity.
the edit inventory should also allow the update of unti type, not just quantity.  also allow a translation of the unit type and value of the inventory item on this page.
add recipe should default to by category first.
drop box sizes need to be sure they are touching on mobile, especially noted on the add recipe case of the search page.
the shopping list buttons fall out of alignment and provide a poor UX