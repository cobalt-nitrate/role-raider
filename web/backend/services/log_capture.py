import re

_ANSI = re.compile(r'\x1b\[[0-9;]*[mGKHF]')
_RICH = re.compile(r'\[/?[a-zA-Z_][\w ]*\]')


def strip_ansi(s: str) -> str:
    return _RICH.sub('', _ANSI.sub('', s)).strip()
