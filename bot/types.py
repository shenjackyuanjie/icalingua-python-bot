
from lib_not_dr.types import Options


class SocketData(Options):
    name = 'SocketData'

    def to_json(self) -> dict:
        return self.option()


class AddMessage(SocketData):
    name = 'icalingua socket add message event'

    roomId: int


