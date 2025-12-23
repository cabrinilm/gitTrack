import { getProfile } from "../../src/services/profile.service";

describe("Profile Service", () => {
  it("should return the user's profile when it exists", async () => {
    const fakeUserId = "123e4567-e89b-12d3-a456-426614174000";
  
    const fakeProfile = {
      id: fakeUserId,
      email: "test@example.com",
      name: "Test User",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  
    const mockSupabase = {
      from: () => ({
        select: () => ({
          eq: (column: string, value: string) => ({ 
            single: async () => {
              if (value === fakeUserId) {
                return { data: fakeProfile, error: null };
              } else {
                return { data: null, error: null };
              }
            },
          }),
        }),
      }),
    };
  
    const profile = await getProfile(mockSupabase as any, fakeUserId);
  
    expect(profile).toEqual(fakeProfile);
    expect(profile.email).toBe("test@example.com");
    expect(profile.name).toBe("Test User");
  });
  it("should thrown an error if the profile is not found", async () => {
    const fakeUserId = "123e4567-e89b-12d3-a456-426614174000";
    const userNotFound =  "123e4567-e89b-12d3-a456-426614174111"
   
    const fakeProfile = {
      id: fakeUserId,
      email: "test@example123.com",
      name: "Test User",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

      
    const mockSupabase = {
      from: () => ({
        select: () => ({
          eq: (column: string, value: string) => ({
            single: async () => {
             if(value === fakeUserId){
              return {data: fakeProfile, error:null};
             } else {
              return {data: null, error: null};
             }
            },
          }),
        }),
      }),
    };
   
    const profile = await getProfile(mockSupabase as any, userNotFound);
   
    expect(profile).toBeNull();



  })
});