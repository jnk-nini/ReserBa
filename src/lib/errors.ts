// Turns a database refusal into a sentence a person can act on.
// The database rules already raise plain-word messages (for example "Outside
// operating hours"). Those are passed through. Postgres' own technical
// messages are replaced.

type DatabaseError = { code?: string; message: string };

export function friendlyError(error: DatabaseError) {
  switch (error.code) {
    case "P0001":
      // Raised on purpose by one of our database rules.
      return error.message;
    case "23P01":
      return "That time overlaps another reservation of this amenity (the buffer time counts too). Please pick another time.";
    case "23505":
      return "That record already exists.";
    case "23503":
      return "This is used by other records, so it cannot be removed.";
    case "23514":
      return "One of the values is not allowed. Please check the form.";
    case "42501":
      return "You are not allowed to do that.";
    case "PGRST116":
      return "That record was not found, or you are not allowed to change it.";
    default:
      return "Something went wrong while saving. Please try again.";
  }
}
