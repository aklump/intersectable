/**
 * @file
 * Tests provided against the Intersectable class.
 *
 * @ingroup intersectable
 * @{
 */
var QUnit         = QUnit || {};
QUnit.storage     = {};
var Intersectable = Intersectable || {};
var obj           = {};

QUnit.test("Assert overlaps works correctly.", function(assert) {
  var mom = obj.getElementBounds($('#mom'));
  var dad = obj.getElementBounds($('#dad'));
  var baby = obj.getElementBounds($('#baby'));

  assert.notOk(obj.overlaps(mom, dad));
  assert.ok(obj.overlaps(mom, baby));  
  assert.ok(obj.overlaps(dad, baby));  
});

QUnit.test("Assert intersection works correctly.", function(assert) {
  var mom = obj.getElementBounds($('#mom'));
  var dad = obj.getElementBounds($('#dad'));
  var baby = obj.getElementBounds($('#baby'));
  assert.strictEqual(obj.intersection(mom, dad), -1);
  assert.strictEqual(obj.intersection(dad, mom), 1);

  assert.strictEqual(obj.intersection(dad, baby), 0);
  assert.strictEqual(obj.intersection(mom, baby), 0);

  // Throw in a curveball to see what happens.
  assert.strictEqual(obj.intersection(baby, baby), 0);
});

QUnit.test("Assert getWindowCenterBounds works.", function(assert) {
  var height  = $(window).height();
  var span    = height / 10;
  var control = [height / 2 - span / 2, height / 2 + span / 2];
  assert.deepEqual(obj.getWindowCenterBounds(span, 'center'), control, "Height as pixels works.");
  assert.deepEqual(obj.getWindowCenterBounds('10%', 'center'), control, "Height as percentage works.");
});

QUnit.test("Assert getBoundsFromPoint works.", function(assert) {
  var item;
  item = obj.getBoundsFromPoint(100, 50);
  assert.deepEqual(item, [75, 125]);
  
  item = obj.getBoundsFromPoint(100, 50, 'center');
  assert.deepEqual(item, [75, 125]);
  
  item = obj.getBoundsFromPoint(100, 50, 'top');
  assert.deepEqual(item, [100, 150]);

  item = obj.getBoundsFromPoint(100, 50, 'bottom');
  assert.deepEqual(item, [50, 100]);
});

QUnit.test("Assert showBounds accepts classes as string.", function(assert) {
  obj.showBounds(obj.items.window, 'dinner', 'do re');
  var $el = $("#intersectable__dinner");
  assert.ok($el.hasClass('do'));
  assert.ok($el.hasClass('re'));
});

QUnit.test("Assert showBounds creates a div with id and classes.", function(assert) {
  obj.showBounds(obj.items.window, 'dinner', ['do', 're']);
  var $el = $("#intersectable__dinner");
  assert.ok($el.length);
  assert.ok($el.hasClass('do'));
  assert.ok($el.hasClass('re'));
});

QUnit.test("Assert obj.items.window exists with proper values.", function(assert) {
  assert.deepEqual(obj.items.window, [0, $(window).height()]);
});

QUnit.test("Checking css prefix.", function(assert) {
  var obj = new Intersectable({cssPrefix: 'merlin-'});
  assert.strictEqual(obj.pre('top'), 'merlin-top');
});

QUnit.test("addOffset works", function(assert) {
  assert.deepEqual(obj.addOffset([0, 70], 5), [5, 75]);
  assert.deepEqual(obj.addOffset([25, 75], -25), [0, 50]);
});

QUnit.test("getCenter works", function(assert) {
  assert.strictEqual(obj.getCenter([0, 70]), 35);
  assert.strictEqual(obj.getCenter([55, 75]), 65);
  assert.strictEqual(obj.getCenter([-100, 100]), 0);
});

QUnit.test("getHeight works", function(assert) {
  assert.strictEqual(obj.getHeight([45, 90]), 45);
  assert.strictEqual(obj.getHeight([0, 90]), 90);
  assert.strictEqual(obj.getHeight([-10, 90]), 100);
});

QUnit.test("Able to instantiate and find version.", function(assert) {
  var intersectable = new Intersectable();
  assert.ok(intersectable instanceof Intersectable, "Instantiated object is an instance of Intersectable.");
  assert.ok(intersectable.version, "Version is not empty.");
});

//
//
// Per test setup
//
QUnit.testStart(function (details) {
  // Create a new DOM element #test, cloned from #template.
  $('#test').replaceWith(QUnit.storage.$template.clone().attr('id', 'test'));
  
  // Create a new intersectable to be used in each test.
  obj = new Intersectable();
});

QUnit.testDone(function () {
  // Reset out class prototype, which may have been altered in a test.
  Intersectable.prototype = QUnit.storage.prototype;

  // Reset the html classes per the default.
  $('html').attr('class', QUnit.storage.htmlClass);
});

// Callback fires before all tests.
QUnit.begin(function () {
  QUnit.storage.htmlClass = $('html').attr('class') || '';
  QUnit.storage.prototype = $.extend({}, Intersectable.prototype);
  QUnit.storage.$template = $('#template').clone();
  $('#template').replaceWith(QUnit.storage.$template.clone().attr('id', 'test'));
});

// Callback fires after all tests.
QUnit.done(function () {
  $('#test').replaceWith(QUnit.storage.$template);
});