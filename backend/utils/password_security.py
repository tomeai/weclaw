from pwdlib import PasswordHash
from pwdlib.hashers.bcrypt import BcryptHasher

password_hash = PasswordHash((BcryptHasher(),))


def get_hash_password(password: str, salt: bytes | None) -> str:
    """
    使用哈希算法加密密码

    :param password: 密码
    :param salt: 盐值
    :return:
    """
    return password_hash.hash(password, salt=salt)


def password_verify(plain_password: str, hashed_password: str) -> bool:
    """
    密码验证

    :param plain_password: 待验证的密码
    :param hashed_password: 哈希密码
    :return:
    """
    return password_hash.verify(plain_password, hashed_password)
