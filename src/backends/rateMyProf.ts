const RMP_BASE_URL = "https://www.ratemyprofessors.com"
const RMP_API_URL = "https://www.ratemyprofessors.com/graphql"
const BASIC_AUTH_KEY = "dGVzdDp0ZXN0"

interface RMPData {
  rating: number
  link: string
}

interface PartialProf {
  node: {
    avgRating: number
    firstName: string
    lastName: string
    legacyId: string
  }
}

export default async function fetchProfRating(
  profName: string,
  isVancouver: boolean
): Promise<RMPData | null> {
  const nameParts = profName.split(" ")
  if (nameParts.length < 2) throw "Name does not include both first and last!"
  const firstName = nameParts.shift()!
  const lastName = nameParts.pop()!

  const headers = new Headers({
    Authorization: `Basic ${BASIC_AUTH_KEY}`,
    "Content-Type": "application/json",
  })
  const req = new Request(RMP_API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(buildRMPQueryBody(profName, isVancouver)),
  })
  const rawRes = await fetch(req)
  const res = await rawRes.json()

  const rawProfs: PartialProf[] = res["data"]["search"]["teachers"]["edges"]
  if (rawProfs.length === 0) return null
  for (const prof of rawProfs) {
    // we avoid using a more sophisticated matching method as i
    // want to reduce the chances of returning an incorrect
    // rating - would rather return null.
    if (
      prof.node.firstName.startsWith(firstName) &&
      prof.node.lastName.endsWith(lastName) &&
      prof.node.avgRating !== 0
    )
      return {
        rating: prof.node.avgRating,
        link: `${RMP_BASE_URL}/professor/${prof.node.legacyId}`,
      }
  }
  return null
}

const buildRMPQueryBody = (profName: string, isVancouver: boolean) => {
  // request body copied directly from ratemyprofessors.com
  const schoolID = isVancouver ? "U2Nob29sLTE0MTM=" : "U2Nob29sLTU0MzY="
  return {
    query:
      'query TeacherSearchResultsPageQuery(\n  $query: TeacherSearchQuery!\n  $schoolID: ID\n  $includeSchoolFilter: Boolean!\n) {\n  search: newSearch {\n    ...TeacherSearchPagination_search_1ZLmLD\n  }\n  school: node(id: $schoolID) @include(if: $includeSchoolFilter) {\n    __typename\n    ... on School {\n      name\n    }\n    id\n  }\n}\n\nfragment TeacherSearchPagination_search_1ZLmLD on newSearch {\n  teachers(query: $query, first: 8, after: "") {\n    didFallback\n    edges {\n      cursor\n      node {\n        ...TeacherCard_teacher\n        id\n        __typename\n      }\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n    resultCount\n    filters {\n      field\n      options {\n        value\n        id\n      }\n    }\n  }\n}\n\nfragment TeacherCard_teacher on Teacher {\n  id\n  legacyId\n  avgRating\n  numRatings\n  ...CardFeedback_teacher\n  ...CardSchool_teacher\n  ...CardName_teacher\n  ...TeacherBookmark_teacher\n}\n\nfragment CardFeedback_teacher on Teacher {\n  wouldTakeAgainPercent\n  avgDifficulty\n}\n\nfragment CardSchool_teacher on Teacher {\n  department\n  school {\n    name\n    id\n  }\n}\n\nfragment CardName_teacher on Teacher {\n  firstName\n  lastName\n}\n\nfragment TeacherBookmark_teacher on Teacher {\n  id\n  isSaved\n}\n',
    variables: {
      query: {
        text: profName,
        schoolID,
        fallback: false,
        departmentID: null,
      },
      schoolID,
      includeSchoolFilter: true,
    },
  }
}

export { fetchProfRating, type RMPData }
