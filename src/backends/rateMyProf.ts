const RMP_API_URL = "https://www.ratemyprofessors.com/graphql"
const BASIC_AUTH_KEY = "dGVzdDp0ZXN0"

export default async function fetchProfRating(
  profName: string
): Promise<number> {
  const headers = new Headers({
    Authorization: `Basic ${BASIC_AUTH_KEY}`,
    "Content-Type": "application/json",
  })
  const req = new Request(RMP_API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(buildRMPQueryBody(profName)),
  })
  const rawRes = await fetch(req)
  const res = await rawRes.json()
  const rating =
    res["data"]["search"]["teachers"]["edges"][0]["node"]["avgRating"]
  return rating
}

const buildRMPQueryBody = (profName: string) => {
  // request body copied directly from ratemyprofessors.com
  return {
    query:
      'query TeacherSearchResultsPageQuery(\n  $query: TeacherSearchQuery!\n  $schoolID: ID\n  $includeSchoolFilter: Boolean!\n) {\n  search: newSearch {\n    ...TeacherSearchPagination_search_1ZLmLD\n  }\n  school: node(id: $schoolID) @include(if: $includeSchoolFilter) {\n    __typename\n    ... on School {\n      name\n    }\n    id\n  }\n}\n\nfragment TeacherSearchPagination_search_1ZLmLD on newSearch {\n  teachers(query: $query, first: 8, after: "") {\n    didFallback\n    edges {\n      cursor\n      node {\n        ...TeacherCard_teacher\n        id\n        __typename\n      }\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n    resultCount\n    filters {\n      field\n      options {\n        value\n        id\n      }\n    }\n  }\n}\n\nfragment TeacherCard_teacher on Teacher {\n  id\n  legacyId\n  avgRating\n  numRatings\n  ...CardFeedback_teacher\n  ...CardSchool_teacher\n  ...CardName_teacher\n  ...TeacherBookmark_teacher\n}\n\nfragment CardFeedback_teacher on Teacher {\n  wouldTakeAgainPercent\n  avgDifficulty\n}\n\nfragment CardSchool_teacher on Teacher {\n  department\n  school {\n    name\n    id\n  }\n}\n\nfragment CardName_teacher on Teacher {\n  firstName\n  lastName\n}\n\nfragment TeacherBookmark_teacher on Teacher {\n  id\n  isSaved\n}\n',
    variables: {
      query: {
        text: profName,
        schoolID: "U2Nob29sLTE0MTM=",
        fallback: true,
        departmentID: null,
      },
      schoolID: "U2Nob29sLTE0MTM=",
      includeSchoolFilter: true,
    },
  }
}
