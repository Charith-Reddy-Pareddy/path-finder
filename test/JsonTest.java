import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

/**
 * Unit tests for Json's hand-rolled escaping. Every intersection name in
 * RoadNetwork is plain ASCII with no special characters, so these code
 * paths (quotes, backslashes, control characters) are otherwise never
 * exercised by the integration tests.
 */
public class JsonTest {

  @Test
  public void stringEscapesQuotesAndBackslashes() {
    assertEquals("\"say \\\"hi\\\"\"", Json.string("say \"hi\""));
    assertEquals("\"C:\\\\path\"", Json.string("C:\\path"));
  }

  @Test
  public void stringEscapesControlCharacters() {
    assertEquals("\"a\\nb\"", Json.string("a\nb"));
    assertEquals("\"a\\rb\"", Json.string("a\rb"));
    assertEquals("\"a\\tb\"", Json.string("a\tb"));
    assertEquals("\"a\\u0001b\"", Json.string("a\u0001b"));
  }

  @Test
  public void stringLeavesOrdinaryTextUntouched() {
    assertEquals("\"State St & Gilman St\"", Json.string("State St & Gilman St"));
    assertEquals("\"\"", Json.string(""));
  }

  @Test
  public void numberFormatsIntegersWithoutDecimalPoint() {
    assertEquals("0", Json.number(0.0));
    assertEquals("5", Json.number(5.0));
    assertEquals("-3", Json.number(-3.0));
  }

  @Test
  public void numberKeepsDecimalPlacesForFractions() {
    assertEquals("0.35", Json.number(0.35));
    assertEquals("2.1", Json.number(2.1));
  }

  @Test
  public void errorProducesAnObjectWithAnEscapedMessage() {
    assertEquals("{\"error\":\"bad \\\"input\\\"\"}", Json.error("bad \"input\""));
  }
}
