"""Contains convenience function to support exception handling."""


def derive_exception_message(
    ex: Exception, print_args: bool = False, default_msg: str = "Unknown error"
) -> str:
    """
    Extracts an error message from a potentially nested exception.
    :param ex: The exception to extract the error message from.
    :param print_args: True, if the arguments of the exception shall be printed.
    :param default_msg: Overwrite the default message that is used in case no other message could be derived.
    :return: The extracted error message or a default message.
    """
    msg: str = default_msg
    if print_args:
        msg = " caused by: ".join([f'"{arg}"' for arg in ex.args])
    else:
        if str(ex):
            # use exception message directly
            msg = str(ex)
        elif ex.__cause__ and str(ex.__cause__):
            # use exception message from causing exception (raised with 'from')
            msg = str(ex.__cause__)

    return msg
