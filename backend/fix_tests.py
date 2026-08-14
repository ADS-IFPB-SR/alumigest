import re

with open('src/test/java/br/edu/ifpb/alumigest/catalog/service/AluminumProfileServiceTest.java', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix ObjectMapper
content = content.replace(
    'import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;',
    'import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;\nimport com.fasterxml.jackson.databind.ObjectMapper;'
)
content = content.replace(
    '    private AluminumProfileMapper aluminumProfileMapper = new AluminumProfileMapper();',
    '    private ObjectMapper objectMapper = new ObjectMapper();\n    private AluminumProfileMapper aluminumProfileMapper = new AluminumProfileMapper(objectMapper);'
)
content = content.replace('@Spy\n    private AluminumProfileMapper', 'private AluminumProfileMapper')

# Fix AluminumProfileRequestDTO
# Find new AluminumProfileRequestDTO( ... ) and append the weight param.
# Wait, let's just do it manually with regex targeting specifically the DTO instantiation.
# They look like: new AluminumProfileRequestDTO(\n ... \n new BigDecimal("..."),\n new BigDecimal("...")\n );
def repl_dto(m):
    return m.group(1) + ',\n                    new BigDecimal("1.500")' + m.group(2)

content = re.sub(
    r'(new AluminumProfileRequestDTO\([^;]+?new BigDecimal\("[0-9.]+"\))(\s*\))',
    repl_dto,
    content,
    flags=re.MULTILINE
)

with open('src/test/java/br/edu/ifpb/alumigest/catalog/service/AluminumProfileServiceTest.java', 'w', encoding='utf-8') as f:
    f.write(content)
