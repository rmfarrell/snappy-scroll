##Architecture for a site that scrolls one slide at a time.

Checkout main.js for implementation. It's well-commented.

###Public methods

* **init()** - instantiates snappiness
* **next()** - go to next slide
* **previous()** - go to previous slide
* **snapTo(slide)** - Advances to specific slide. Takes either slide element's ID or index of slide. 
* **setUp(callback)** - Replace the scroll up function with a custom action. Custom action is specified in the argument.
* **setDown(callback)** - Replace the scroll down function with a custom action. Custom action is specified in the argument.
* **resetUpDown(callback)** - Replaces a custom action (defined by setUp or setDown) with default slide advancement action

Todo: add pushstate support.

