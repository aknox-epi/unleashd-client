# RescueGroups API - Animal Fields Documentation

> **Auto-generated documentation**
> Last updated: 2025-11-11T00:06:18.200Z
> Total fields available: 141

## Overview

This document provides comprehensive information about all available animal fields in the RescueGroups API v2.
The data was retrieved using the `objectAction: "define"` endpoint.

## Currently Used Fields

These fields are currently requested in the `ANIMAL_FIELDS` constant in `services/rescuegroups/animals.ts`:

- **animalID**
- **animalName**
- **animalSpecies**
- **animalBreed**
- **animalSex**
- **animalGeneralAge**
- **animalLocationCitystate**
- **animalPictures**
- **animalThumbnailUrl**

## All Available Fields by Category

### Adoption

#### `animalAdoptionFee`

**Type:** string

#### `animalAdoptionPending`

**Type:** string
**Valid values:**

- Yes
- No

### Behavior

#### `animalEnergyLevel`

**Type:** string
**Valid values:**

-
- Low
- Moderate
- High

#### `animalExerciseNeeds`

**Type:** string
**Valid values:**

-
- Not Required
- Low
- Moderate
- High

#### `animalFence`

**Type:** string
**Valid values:**

-
- Not Required
- Any Type
- 3 foot
- 6 foot

#### `animalOKForSeniors`

**Type:** string
**Valid values:**

-
- Yes

#### `animalOKWithAdults`

**Type:** string
**Valid values:**

-
- All
- Men Only
- Women Only

#### `animalOKWithCats`

**Type:** string
**Valid values:**

-
- Yes
- No

#### `animalOKWithDogs`

**Type:** string
**Valid values:**

-
- Yes
- No

#### `animalOKWithFarmAnimals`

**Type:** string
**Valid values:**

-
- Yes

#### `animalVocal`

**Type:** string
**Valid values:**

-
- Quiet
- Some
- Lots

### Description

#### `animalDescription`

**Type:** string

#### `animalDescriptionPlain`

**Type:** string

#### `animalDistinguishingMarks`

**Type:** string

### Health

#### `animalAltered`

**Type:** string
**Valid values:**

-
- No
- Yes

#### `animalDeclawed`

**Type:** string
**Valid values:**

-
- Yes
- No

#### `animalGroomingNeeds`

**Type:** string
**Valid values:**

-
- Not Required
- Low
- Moderate
- High

#### `animalHousetrained`

**Type:** string
**Valid values:**

-
- No
- Yes

#### `animalNotHousetrainedReason`

**Type:** string

#### `animalSpecialDiet`

**Type:** string
**Valid values:**

-
- Yes

#### `animalSpecialneeds`

**Type:** string
**Valid values:**

-
- No
- Yes

#### `animalSpecialneedsDescription`

**Type:** string

### Identification

#### `animalColorID`

**Type:** key
**Valid values:**

#### `animalID`

**Type:** key

#### `animalName`

**Type:** string

#### `animalOKWithKids`

**Type:** string
**Valid values:**

-
- Yes
- No

#### `animalOlderKidsOnly`

**Type:** string
**Valid values:**

-
- Yes

#### `animalOrgID`

**Type:** key
**Valid values:**

#### `animalPatternID`

**Type:** key
**Valid values:**

#### `animalPrimaryBreedID`

**Type:** key
**Valid values:**

#### `animalRescueID`

**Type:** string

#### `animalSecondaryBreedID`

**Type:** key
**Valid values:**

#### `animalSpeciesID`

**Type:** key
**Valid values:**

#### `animalStatusID`

**Type:** key
**Valid values:**

#### `animalTimid`

**Type:** string
**Valid values:**

-
- Yes

#### `animalVideoUrls`

**Type:** string

#### `animalVideos`

**Type:** string

#### `fosterFirstname`

**Type:** string

#### `fosterLastname`

**Type:** string

#### `fosterName`

**Type:** string

#### `locationName`

**Type:** enumLookup

### Location

#### `animalLocation`

**Type:** postalcode

#### `animalLocationCitystate`

**Type:** string

#### `animalLocationCoordinates`

**Type:** string

#### `animalLocationDistance`

**Type:** int

#### `animalLocationState`

**Type:** string

#### `locationAddress`

**Type:** string

#### `locationCity`

**Type:** string

#### `locationCountry`

**Type:** string

#### `locationPhone`

**Type:** string

#### `locationPostalcode`

**Type:** postalcode

#### `locationState`

**Type:** string

#### `locationUrl`

**Type:** string

### Media

#### `animalPictures`

**Type:** string

#### `animalThumbnailUrl`

**Type:** string

#### `animalUrl`

**Type:** url

### Metadata

#### `animalAdoptedDate`

**Type:** date

#### `animalAvailableDate`

**Type:** date

#### `animalBirthdate`

**Type:** date

#### `animalBirthdateExact`

**Type:** string
**Valid values:**

- No
- Yes

#### `animalFoundDate`

**Type:** date

#### `animalKillDate`

**Type:** date

#### `animalStatus`

**Type:** string

#### `animalUpdatedDate`

**Type:** date

#### `animalUptodate`

**Type:** string
**Valid values:**

-
- Yes
- No

### Other

#### `animalActivityLevel`

**Type:** string
**Valid values:**

-
- Not Active
- Slightly Active
- Moderately Active
- Highly Active

#### `animalAffectionate`

**Type:** string
**Valid values:**

-
- Yes

#### `animalApartment`

**Type:** string
**Valid values:**

-
- Yes

#### `animalCoatLength`

**Type:** string
**Valid values:**

-
- Short
- Medium
- Long

#### `animalCourtesy`

**Type:** string
**Valid values:**

- Yes
- No

#### `animalCratetrained`

**Type:** string
**Valid values:**

-
- Yes

#### `animalDrools`

**Type:** string
**Valid values:**

-
- Yes

#### `animalEarType`

**Type:** string
**Valid values:**

-
- Cropped
- Droopy
- Erect
- Long
- Missing
- Notched
- Rose
- Semi-erect
- Tipped
- Natural/Uncropped

#### `animalEscapes`

**Type:** string
**Valid values:**

-
- Yes

#### `animalEventempered`

**Type:** string
**Valid values:**

-
- Yes

#### `animalFetches`

**Type:** string
**Valid values:**

-
- Yes

#### `animalFound`

**Type:** string
**Valid values:**

- Yes
- No

#### `animalFoundPostalcode`

**Type:** postalcode

#### `animalGentle`

**Type:** string
**Valid values:**

-
- Yes

#### `animalGoodInCar`

**Type:** string
**Valid values:**

-
- Yes

#### `animalGoofy`

**Type:** string
**Valid values:**

-
- Yes

#### `animalHasAllergies`

**Type:** string
**Valid values:**

-
- Yes

#### `animalHearingImpaired`

**Type:** string
**Valid values:**

-
- Yes

#### `animalHypoallergenic`

**Type:** string
**Valid values:**

-
- Yes

#### `animalIndependent`

**Type:** string
**Valid values:**

-
- Yes

#### `animalIndoorOutdoor`

**Type:** string
**Valid values:**

-
- Indoor Only
- Indoor and Outdoor
- Outdoor Only

#### `animalIntelligent`

**Type:** string
**Valid values:**

-
- Yes

#### `animalKillReason`

**Type:** string
**Valid values:**

-
- Age
- Behavior
- Breed
- Medical
- Space

#### `animalLap`

**Type:** string
**Valid values:**

-
- Yes

#### `animalLeashtrained`

**Type:** string
**Valid values:**

-
- Yes

#### `animalMicrochipped`

**Type:** string
**Valid values:**

-
- Yes
- No

#### `animalNeedsCompanionAnimal`

**Type:** string
**Valid values:**

-
- Yes

#### `animalNeedsFoster`

**Type:** string
**Valid values:**

-
- Yes
- No

#### `animalNewPeople`

**Type:** string
**Valid values:**

-
- Cautious
- Friendly
- Protective
- Aggressive

#### `animalNoCold`

**Type:** string
**Valid values:**

-
- Yes

#### `animalNoFemaleDogs`

**Type:** string
**Valid values:**

-
- Yes

#### `animalNoHeat`

**Type:** string
**Valid values:**

-
- Yes

#### `animalNoLargeDogs`

**Type:** string
**Valid values:**

-
- Yes

#### `animalNoMaleDogs`

**Type:** string
**Valid values:**

-
- Yes

#### `animalNoSmallDogs`

**Type:** string
**Valid values:**

-
- Yes

#### `animalObedienceTraining`

**Type:** string
**Valid values:**

-
- Needs Training
- Has Basic Training
- Well Trained

#### `animalObedient`

**Type:** string
**Valid values:**

-
- Yes

#### `animalOngoingMedical`

**Type:** string
**Valid values:**

-
- Yes

#### `animalOwnerExperience`

**Type:** string
**Valid values:**

-
- None
- Species
- Breed

#### `animalPlayful`

**Type:** string
**Valid values:**

-
- Yes

#### `animalPlaysToys`

**Type:** string
**Valid values:**

-
- Yes

#### `animalPredatory`

**Type:** string
**Valid values:**

-
- Yes

#### `animalProtective`

**Type:** string
**Valid values:**

-
- Yes

#### `animalSearchString`

**Type:** string

#### `animalShedding`

**Type:** string
**Valid values:**

-
- Moderate
- None
- High

#### `animalSightImpaired`

**Type:** string
**Valid values:**

-
- Yes

#### `animalSkittish`

**Type:** string
**Valid values:**

-
- Yes

#### `animalSponsorable`

**Type:** string
**Valid values:**

- Yes
- No

#### `animalSponsors`

**Type:** string

#### `animalSponsorshipDetails`

**Type:** string

#### `animalSponsorshipMinimum`

**Type:** decimal

#### `animalSummary`

**Type:** string

#### `animalSwims`

**Type:** string
**Valid values:**

-
- Yes

#### `animalTailType`

**Type:** string
**Valid values:**

-
- Bare
- Bob
- Curled
- Docked
- Kinked
- Long
- Missing
- Short

#### `animalYardRequired`

**Type:** string
**Valid values:**

-
- Yes
- No

#### `fosterEmail`

**Type:** string

#### `fosterPhoneCell`

**Type:** string

#### `fosterPhoneHome`

**Type:** string

#### `fosterSalutation`

**Type:** string

### Physical

#### `animalAgeString`

**Type:** string

#### `animalBreed`

**Type:** string

#### `animalColor`

**Type:** string

#### `animalColorDetails`

**Type:** string

#### `animalEagerToPlease`

**Type:** string
**Valid values:**

-
- Yes

#### `animalEyeColor`

**Type:** string
**Valid values:**

-
- Black
- Blue
- Blue-brown
- Brown
- Copper
- Gold
- Gray
- Green
- Hazelnut
- Mixed
- Pink
- Yellow

#### `animalGeneralAge`

**Type:** string
**Valid values:**

-
- Baby
- Young
- Adult
- Senior

#### `animalGeneralSizePotential`

**Type:** string
**Valid values:**

-
- Small
- Medium
- Large
- X-Large

#### `animalMixedBreed`

**Type:** string
**Valid values:**

-
- Yes
- No

#### `animalPattern`

**Type:** string

#### `animalPrimaryBreed`

**Type:** string

#### `animalSecondaryBreed`

**Type:** string

#### `animalSex`

**Type:** string
**Valid values:**

-
- Female
- Male

#### `animalSizeCurrent`

**Type:** decimal

#### `animalSizePotential`

**Type:** decimal

#### `animalSizeUOM`

**Type:** string
**Valid values:**

-
- Centimeters
- Hands
- Inches
- Kilograms
- Ounces
- Pounds

#### `animalSpecies`

**Type:** string

## Raw API Response Structure

```json
{
  "status": "ok",
  "messages": {
    "generalMessages": [],
    "recordMessages": []
  },
  "foundRows": 4,
  "data": {
    "define": {
      "modules": "Public",
      "permissions": "Public"
    },
    "publicView": {
      "modules": "Public",
      "permissions": "Public",
      "fields": {
        "animalID": {
          "friendlyname": "ID",
          "type": "key",
          "modules": "Public",
          "properties": [
            "required"
          ],
          "name": "animalID"
        }
      }
    },
    "publicSearch": {
      "modules": "Public",
      "permissions": "Public",
      "fields": {
        "animalID": {
          "friendlyname": "ID",
          "type": "key",
          "modules": "Public",
          "name": "animalID"
        },
        "animalOrgID": {
          "friendlyname": "Org ID",
          "type": "key",
          "values": "orgs",
          "modules": "Public",
          "name": "animalOrgID"
        },
        "animalActivityLevel": {
          "friendlyname": "Activity level",
          "type": "string",
          "values": [
            "",
            "Not Active",
... (truncated, see animal-fields-raw.json for full response)
```

## Recommendations

Based on the available fields, consider adding these to improve the user experience:

### High Priority

- `animalDescription` or `animalDescriptionPlain` - Full animal description for detail pages
- `animalPrimaryBreed` - More specific breed information
- `animalColor` - Visual characteristic for filtering/display
- `animalStatus` - Important for filtering available animals

### Medium Priority

- `animalOKWithKids`, `animalOKWithCats`, `animalOKWithDogs` - Compatibility filters
- `animalSpecialNeeds` - Important for users seeking special needs pets
- `animalAdoptionFee` - Useful for budgeting
- `animalUpdatedDate` - For showing freshness of listings

### Low Priority

- `animalEnergyLevel`, `animalExerciseNeeds` - Lifestyle matching
- `animalGroomingNeeds` - Care requirements
- `animalUrl` - Link to full listing on RescueGroups
