export class Duration {
  // Store the total duration in milliseconds
  private milliseconds: number;

  constructor(duration: number) {
    this.milliseconds = duration;
  }

  // Convert the duration to different units
  public toMilliseconds(): number {
    return this.milliseconds;
  }

  public toSeconds(): number {
    return Math.floor(this.milliseconds / 1000);
  }

  public toMinutes(): number {
    return Math.floor(this.milliseconds / (1000 * 60));
  }

  public toHours(): number {
    return Math.floor(this.milliseconds / (1000 * 60 * 60));
  }

  public toDays(): number {
    return Math.floor(this.milliseconds / (1000 * 60 * 60 * 24));
  }

  // Parse a duration string into a Duration object
  public static parse(input: string): Duration {
    // If the input is just a number, treat it as seconds
    if (/^\d+$/.test(input)) {
      return new Duration(parseInt(input) * 1000);
    }

    // Regular expression to match duration format (e.g., "7d", "24h", "60m", "30s")
    const durationRegex = /^(\d+)(d|h|m|s)$/;
    const match = input.toLowerCase().match(durationRegex);

    if (!match) {
      throw new Error(
        'Invalid duration format. Use formats like "7d", "24h", "60m", or "30s"',
      );
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    // Convert to milliseconds based on the unit
    const multipliers: Record<string, number> = {
      s: 1000, // seconds to milliseconds
      m: 1000 * 60, // minutes to milliseconds
      h: 1000 * 60 * 60, // hours to milliseconds
      d: 1000 * 60 * 60 * 24, // days to milliseconds
    };

    return new Duration(value * multipliers[unit]);
  }
}
