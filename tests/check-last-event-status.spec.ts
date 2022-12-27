import { set, reset } from 'mockdate'

type EventStatus = { status: string }

class CheckLastEventStatus {
  constructor(private readonly loadLastEventRepository: LoadLastEventRepository) { }

  async perform({ groupId }: { groupId: string }): Promise<EventStatus> {
    const event = await this.loadLastEventRepository.loadLastEvent({ groupId })

    if (event === undefined) return { status: 'done' }

    const now = new Date()
    const status = event.endDate >= now ? 'active' : 'inReview'

    return { status }
  }
}

interface LoadLastEventRepository {
  loadLastEvent(input: { groupId: string }): Promise<{ endDate: Date } | undefined>;
}

class LoadLastEventRepositorySpy implements LoadLastEventRepository {
  groupId?: string
  callsCount = 0
  output?: { endDate: Date }

  async loadLastEvent({ groupId }: { groupId: string }): Promise<{ endDate: Date } | undefined> {
    this.groupId = groupId;
    this.callsCount++
    return this.output
  }
}
type SutOutput = {
  sut: CheckLastEventStatus
  loadLastEventRepository: LoadLastEventRepositorySpy
}

const makeSut = (): SutOutput => {
  const loadLastEventRepository = new LoadLastEventRepositorySpy()
  const sut = new CheckLastEventStatus(loadLastEventRepository)

  return { sut, loadLastEventRepository }
}

describe('CheckLastEventStatus', () => {
  const groupId = 'any_group_id'

  beforeAll(() => set(new Date()))

  afterAll(() => reset())

  it('Should get last event data', async () => {
    const { sut, loadLastEventRepository } = makeSut()

    await sut.perform({ groupId })

    expect(loadLastEventRepository.groupId).toBe(groupId)
    expect(loadLastEventRepository.callsCount).toBe(1)
  })

  it('Should return status done', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.output = undefined

    const eventStatus = await sut.perform({ groupId })

    expect(eventStatus.status).toBe('done')
  })

  it('Should return status active when now is before event end time', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.output = {
      endDate: new Date(new Date().getTime() + 1)
    }

    const eventStatus = await sut.perform({ groupId })

    expect(eventStatus.status).toBe('active')
  })

  it('Should return status active when now is to equal event end time', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.output = {
      endDate: new Date()
    }

    const eventStatus = await sut.perform({ groupId })

    expect(eventStatus.status).toBe('active')
  })

  it('Should return status inReview when now is after event end time', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.output = {
      endDate: new Date(new Date().getTime() - 1)
    }

    const EventStatus = await sut.perform({ groupId })

    expect(EventStatus.status).toBe('inReview')
  })
})