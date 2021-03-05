import {diff, getRadioState} from "./getFixtures"

test("the diff function", async () => {
    expect(await diff(3.5, 1)).toBe("2.50")
})

test("the radio state function", async() => {
    expect(await getRadioState(6)).toBe(6)
})