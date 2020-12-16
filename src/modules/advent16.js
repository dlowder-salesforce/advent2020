/*
--- Day 16: Ticket Translation ---

As you're walking to yet another connecting flight, you realize that one of the
legs of your re-routed trip coming up is on a high-speed train. However, the
train ticket you were given is in a language you don't understand. You should
probably figure out what it says before you get to the train station after the
next flight.

Unfortunately, you can't actually read the words on the ticket. You can,
however, read the numbers, and so you figure out the fields these tickets must
have and the valid ranges for values in those fields.

You collect the rules for ticket fields, the numbers on your ticket, and the
numbers on other nearby tickets for the same train service (via the airport
security cameras) together into a single document you can reference (your
puzzle input).

The rules for ticket fields specify a list of fields that exist somewhere on
the ticket and the valid ranges of values for each field. For example, a rule
like class: 1-3 or 5-7 means that one of the fields in every ticket is named
class and can be any value in the ranges 1-3 or 5-7 (inclusive, such that 3 and
5 are both valid in this field, but 4 is not).

Each ticket is represented by a single line of comma-separated values. The
values are the numbers on the ticket in the order they appear; every ticket has
the same format. For example, consider this ticket:

.--------------------------------------------------------.
| ????: 101    ?????: 102   ??????????: 103     ???: 104 |
|                                                        |
| ??: 301  ??: 302             ???????: 303      ??????? |
| ??: 401  ??: 402           ???? ????: 403    ????????? |
'--------------------------------------------------------'

Here, ? represents text in a language you don't understand. This ticket might
be represented as 101,102,103,104,301,302,303,401,402,403; of course, the
actual train tickets you're looking at are much more complicated. In any case,
you've extracted just the numbers in such a way that the first number is always
the same specific field, the second number is always a different specific
field, and so on - you just don't know what each position actually means!

Start by determining which tickets are completely invalid; these are tickets
that contain values which aren't valid for any field. Ignore your ticket for
now.

For example, suppose you have the following notes:

class: 1-3 or 5-7
row: 6-11 or 33-44
seat: 13-40 or 45-50

your ticket:
7,1,14

nearby tickets:
7,3,47
40,4,50
55,2,20
38,6,12

It doesn't matter which position corresponds to which field; you can identify
invalid nearby tickets by considering only whether tickets contain values that
are not valid for any field. In this example, the values on the first nearby
ticket are all valid for at least one field. This is not true of the other
three nearby tickets: the values 4, 55, and 12 are are not valid for any field.
Adding together all of the invalid values produces your ticket scanning error
rate: 4 + 55 + 12 = 71.

Consider the validity of the nearby tickets you scanned. What is your ticket
scanning error rate?

Your puzzle answer was 26009.

--- Part Two ---

Now that you've identified which tickets contain invalid values, discard those
tickets entirely. Use the remaining valid tickets to determine which field is
which.

Using the valid ranges for each field, determine what order the fields appear
on the tickets. The order is consistent between all tickets: if seat is the
third field, it is the third field on every ticket, including your ticket.

For example, suppose you have the following notes:

class: 0-1 or 4-19
row: 0-5 or 8-19
seat: 0-13 or 16-19

your ticket:
11,12,13

nearby tickets:
3,9,18
15,1,5
5,14,9

Based on the nearby tickets in the above example, the first position must be
row, the second position must be class, and the third position must be seat;
you can conclude that in your ticket, class is 12, row is 11, and seat is 13.

Once you work out which field is which, look for the six fields on your ticket
that start with the word departure. What do you get if you multiply those six
values together?

Your puzzle answer was 589685618167.

Both parts of this puzzle are complete! They provide two gold stars: **

  */
const fs = require('fs');

const readInput = (inputFilePath) => {
  const lines = fs.readFileSync(inputFilePath, 'utf-8').split('\n');
  const fields = new Map();
  const allValidValues = new Set();
  let reachedYourTicket = false;
  let reachedNearbyTickets = false;
  let yourTicket = null;
  const nearbyTickets = [];
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(
      /([^:]*): ([0-9]*)-([0-9]*) or ([0-9]*)-([0-9]*)/,
    );
    if (match && match.length === 6) {
      const key = match[1];
      const range1 = [parseInt(match[2]), parseInt(match[3])];
      const range2 = [parseInt(match[4]), parseInt(match[5])];
      const validValues = new Set();
      for (let r1 = range1[0]; r1 <= range1[1]; r1++) {
        validValues.add(r1);
        allValidValues.add(r1);
      }
      for (let r2 = range2[0]; r2 <= range2[1]; r2++) {
        validValues.add(r2);
        allValidValues.add(r2);
      }
      fields.set(key, validValues);
    }
  }
  for (let j = 0; j < lines.length; j++) {
    if (lines[j].startsWith('your ticket')) {
      reachedYourTicket = true;
    } else if (reachedYourTicket) {
      yourTicket = lines[j].split(',');
      reachedYourTicket = false;
    }
  }
  for (let k = 0; k < lines.length; k++) {
    if (lines[k].indexOf('nearby tickets') !== -1) {
      reachedNearbyTickets = true;
    } else if (reachedNearbyTickets && lines[k].match(/[0-9,]/)) {
      nearbyTickets.push(lines[k].split(',').map((n) => parseInt(n)));
    }
  }
  return {
    yourTicket,
    nearbyTickets,
    fields,
    allValidValues,
  };
};

const part1 = (inputFilePath) => {
  const {yourTicket, nearbyTickets, fields, allValidValues} = readInput(
    inputFilePath,
  );
  let sum = 0;
  for (let t of nearbyTickets) {
    for (let n of t) {
      if (!allValidValues.has(n)) {
        sum = sum + n;
      }
    }
  }
  return sum;
};

const part2 = (inputFilePath) => {
  const {yourTicket, nearbyTickets, fields, allValidValues} = readInput(
    inputFilePath,
  );
  const validNearbyTickets = [];
  for (let t of nearbyTickets) {
    let ticketIsValid = true;
    for (let n of t) {
      if (!allValidValues.has(n)) {
        ticketIsValid = false;
        break;
      }
    }
    if (ticketIsValid) {
      validNearbyTickets.push(t);
    }
  }
  const possibleFieldArray = [];
  for (let i = 0; i < yourTicket.length; i++) {
    const possibleFields = new Set();
    for (let name of fields.keys()) {
      let possible = true;
      for (let j = 0; j < validNearbyTickets.length; j++) {
        if (!fields.get(name).has(validNearbyTickets[j][i])) {
          possible = false;
          break;
        }
      }
      if (possible) {
        possibleFields.add(name);
      }
    }
    possibleFieldArray.push(possibleFields);
  }
  while (
    possibleFieldArray.map((s) => s.size).reduce((a, b) => a + b, 0) >
    possibleFieldArray.length
  ) {
    const definites = possibleFieldArray
      .filter((s) => s.size === 1)
      .map((s) => Array.from(s)[0]);
    for (let key of definites) {
      for (let p of possibleFieldArray) {
        if (p.size > 1) {
          p.delete(key);
        }
      }
    }
  }
  const fieldNames = possibleFieldArray.map((p) => Array.from(p)[0]);
  return yourTicket
    .filter((v, i) => fieldNames[i].startsWith('departure'))
    .reduce((a, b) => a * b, 1);
};

module.exports = {
  part1,
  part2,
};
