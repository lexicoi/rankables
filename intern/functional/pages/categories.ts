import intern from "intern";

const { suite, test } = intern.getPlugin("intern.tdd");
const { assert } = intern.getPlugin("chai");

suite("Category Page Tests", () => {
  test("Adding a new category is possible", () => {
    return this.remote
      .get('http://localhost:4200/categories/General')
      .findByXpath('id("ember240")/DIV/DIV[1]/DIV/DIV[1]/DIV[3]/FORM/INPUT[1]')
      .moveMouseTo(99.01420593261719, 23.934661865234375)
      .clickMouseButton(0)
      .end()
      .findByXpath('id("ember240")/DIV/DIV[1]/DIV/DIV[1]/DIV[3]/FORM/INPUT[2]')
      .moveMouseTo(8.411956787109375, 9.934661865234375)
      .clickMouseButton(0)
      .end()
      .findByXpath('id("ember240")/DIV/DIV[1]/DIV/DIV[1]/DIV[3]/FORM/INPUT[1]')
      .moveMouseTo(168.0142059326172, 13.934661865234375)
      .clickMouseButton(0)
      .end()
      .findByXpath('id("ember240")/DIV/DIV[1]/DIV/DIV[1]/DIV[3]/FORM/INPUT[2]')
      .moveMouseTo(13.411956787109375, 9.934661865234375)
      .clickMouseButton(0);
  });
});
