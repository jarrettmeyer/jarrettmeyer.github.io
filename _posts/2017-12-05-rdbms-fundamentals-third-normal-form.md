---
title:    "RDBMS Fundamentals: Third Normal Form"
layout:   post
post:     2017-12-05
---

This is a continuation on a series of posts on [RDMBS Fundamentals](/projects#rdbms-fundamentals). We have previously covered [first normal form](/2017/12/01/rdbms-fundamentals-first-normal-form) and [second normal form](/2017/12/04/rdbms-fundamentals-second-normal-form). Third normal form, or 3NF, continues where we left 2NF.

### Requirements for 3NF

A table satisfies third normal form if:

* the table satisfies the requirements for second normal form, and
* it contains only columns that are non-transitively dependent on the primary key.

What does this mean? Well, it means we are starting to get deep into the semantic meaning of your data.

Let's start with an address table. Let's create entries for the Marion County Clerk's Office and a local yoga studio.

| address_key | line_1 | line_2 | city | state | zip_code |
| :--: | :--: | :--: | :--: | :--: | :--: |
| 1234 | 200 E WASHINTON ST | STE W122 | INDIANAPOLIS | IN | 46204 |
| 5678 | 1032 N MAIN ST | *null*  | SPEEDWAY | IN | 46224 |

If we have spent any time around data, we have probably seen this data structure way too many times. However, did you know that this does not satisfy 3NF? There are **tons** of interdependent data values in this one line.

1. Indianapolis is a city in Indiana. There is no Seattle, Indiana, and there is no Indianapolis, Washington.
2. There are only so many valid ZIP codes in Indianapolis. The ZIP code and city are dependent on each other. In the grand scheme of addresses, there are relatively few valid city + state + ZIP code combinations.
3. Not all 5 digit numbers are valid ZIP codes. Ideally, we could create a table of all valid ZIP codes.
4. Not all building have multiple units (suites, apartment numbers, floors, etc.).

Let's start breaking down this table so it satisfies 3NF.

#### Revision 1: City and State are related

First, we need a table for states.

| state_key | state_name | state_abbreviation |
| :--: | :--: | :--: |
| 1 | INDIANA | IN |

Our states table should have unique indexes on both the `state_name` and `state_abbreviation` columns.

Second, we need a table for cities. Cities must belong to a single state.

| city_key | city_name | state_key |
| :--: | :--: | :--: |
| 1 | INDIANAPOLIS | 1 |
| 2 | SPEEDWAY | 1 |

Here's our updated address table. The combination of `city_name` and `state_key` should be unique.

| address_key | line_1 | line_2 | city_key | zip_code |
| :--: | :--: | :--: | :--: | :--: | :--: |
| 1234 | 200 E WASHINTON ST | STE W122 | 1 | 46204 |
| 5678 | 1032 N MAIN ST | *null* | 2 | 46224 |

#### Revision 2: ZIP Code and City are related

There are only so many valid combinations of city and ZIP code. A ZIP code can represent multiple cities, and a city can have multiple ZIP codes. This means that we require a many-to-many relationship to represent this model.

We already have a city table. This is our ZIP code table. (There are 63 ZIP codes in Indianapolis, IN. This table has been greatly reduced in size.)

| zip_code_key | zip_code |
| :--: | :--: |
| 1 | 46204 |
| 2 | 46224 |

Each `zip_code` value should be unique.

This is our many-to-many table for cities and ZIP codes. A ZIP code can have multiple cities, and a city can have multiple ZIP codes. The ZIP code for 46204 is only Indianapolis. The ZIP code for 46224 has both Indianapolis and Speedway addresses.

| city2zip_code_key | city_key | zip_code_key |
| :--: | :--: | :--: |
| 1 | 1 | 1 |
| 2 | 1 | 2 |
| 3 | 2 | 2 |

Every combination of `city_key` and `zip_code_key` should be unique.

Our address table now looks like the following.

| address_key | line_1 | line_2 | city2zip_code_key |
| :--: | :--: | :--: | :--: |
| 1234 | 200 E WASHINGTON ST | STE W122 | 1 |
| 5678 | 1032 N MAIN ST | *null* | 3 |

We're getting closer!

#### Revision 3: Unit number and street address are related

We're almost there. We still have one dependency: the unit number and the street address are dependent. If this builder were to be demolished, all of the units would be destroyed with it. If a new building were to built in its place, the availability and numbers of units would also change.

Let's call our this new thing the street address, since that's what it really represents.

| street_address_key | line_1 | city2zip_code_key |
| :--: | :--: | :--: |
| 1 | 200 E WASHINGTON ST | 1 |
| 2 | 1032 N MAIN ST | 3 |

As expected, every combination of `line_1` and `city2zip_code_key` should be unique.

And here's our completed address table. We will make `line_2` non-nullable. Typically, a *null* value means an unknown value. In this case, it is a known empty value. Let's make our data reflect that.

| address_key | street_address_key | line_2 |
| :--: | :--: | :--: |
| 1234 | 1 | STE W122 |
| 5678 | 2 |  |

Finally, every combination of `street_address_key` and `line_2` should be unique.

#### Wait! This is a pain in the butt!

Ugh! I really just want to see line 1, line 2, city, state, ZIP code. Guess what! That's why views exist!

```sql
CREATE VIEW [dbo].[vw_address]
AS
SELECT [dbo].[address].[address_key],
       [dbo].[street_address].[line_1],
       [dbo].[address].[line_2],
       [dbo].[city].[city_name],
       [dbo].[state].[state_name],
       [dbo].[state].[state_abbreviation],
       [dbo].[zip_code].[zip_code],
       [dbo].[city].[city_name] + ', ' + [dbo].[state].[state_abbreviation] + ' ' + [dbo].[zip_code].[zip_code] AS line_3
FROM [dbo].[address]
INNER JOIN [dbo].[street_address] ON [dbo].[address].[street_address_key] = [dbo].[street_address].[street_address_key]
INNER JOIN [dbo].[city2zip_code] ON [dbo].[street_address].[city2zip_code_key] = [dbo].[city2zip_code].[city2zip_code_key]
INNER JOIN [dbo].[city] ON [dbo].[city2zip_code].[city_key] = [dbo].[city].[city_key]
INNER JOIN [dbo].[state] ON [dbo].[city].[state_key] = [dbo].[state].[state_key]
INNER JOIN [dbo].[zip_code] ON [dbo].[city2zip_code].[zip_code_key] = [dbo].[zip_code].[zip_code_key]
```

Remember, tools exist for a reason. The code-level manifestation of an address (line 1, line 2, city, state, ZIP) is not the same as an address in your RDBMS. As you can see, in this type of design, there are no *null* values in any tables and there is no duplication of values.

#### Other considerations

**Note 1:** If we were being really picky, we could make the street it's own table. Streets do - from time to time - get renamed. Ideally, if a street were to get renamed, we would want everything on that street to get updated in one operation.

**Note 2:** I have never seen an address broken up like this. This is the way a data engineer thinks about data; this is not the typical way a software developer thinks about data.

**Note 3:** Nine-digit ZIP codes (ZIP+4) are beyond the scope of this post. It should be clear that the same rules apply. ZIP+4 have rules that make them dependent on address line 1.
