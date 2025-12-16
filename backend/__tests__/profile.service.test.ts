import {getProfile} from "../src/services/profile.services"

describe("Profile Service", () => {
  it("should return the user's profile when it exists", async () => {


    const profile = await getProfile("data.user")

    expect(profile).toBe("data.user")
  })
})
