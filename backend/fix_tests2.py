import re

with open('src/test/java/br/edu/ifpb/alumigest/catalog/service/AluminumProfileServiceTest.java', 'r', encoding='utf-8') as f:
    content = f.read()

# The DTO constructor now has commercialLine as the 3rd argument.
# We need to insert `"Rometal", ` after the second argument.
# The previous script made them look like:
# new AluminumProfileRequestDTO(
#         "Perfil S83 Linha Rometal",
#         "S83",
#         "76042990", // ncmCode, but sometimes it is null
#         ...

def repl_dto(m):
    # m.group(1) is `new AluminumProfileRequestDTO(`
    # m.group(2) is the rest
    # we need to parse the arguments and inject "Rometal" as 3rd
    # Instead of full parsing, we can just split by comma but considering quotes
    return m.group(0)

# Actually, the arguments are pretty consistent in the test:
# "Perfil S83 Linha Rometal",
# "S83",
# (null or "76042990")
# "Branco" or "Natural"
content = re.sub(
    r'(new AluminumProfileRequestDTO\([^,]+,[^,]+,)([\s\S]+?new BigDecimal\("[0-9.]+"\)\s*\))',
    r'\1 "Rometal",\2',
    content,
    flags=re.MULTILINE
)

with open('src/test/java/br/edu/ifpb/alumigest/catalog/service/AluminumProfileServiceTest.java', 'w', encoding='utf-8') as f:
    f.write(content)
