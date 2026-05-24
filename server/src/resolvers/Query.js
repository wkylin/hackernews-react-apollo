async function feed(parent, args, context) {
  const where = args.filter
    ? {
        OR: [
          { description: { contains: args.filter } },
          { url: { contains: args.filter } },
        ],
      }
    : {}

  const count = await context.prisma.link.count({ where })
  const links = await context.prisma.link.findMany({
    where,
    skip: args.skip,
    take: args.first,
    orderBy: parseLinkOrderBy(args.orderBy),
  })

  return {
    count,
    links,
  }
}

function parseLinkOrderBy(orderBy) {
  if (!orderBy) {
    return undefined
  }

  const [field, direction] = orderBy.split('_')
  return {
    [field]: direction.toLowerCase(),
  }
}

export default {
  feed,
}
