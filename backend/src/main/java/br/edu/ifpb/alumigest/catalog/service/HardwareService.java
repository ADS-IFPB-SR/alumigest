package br.edu.ifpb.alumigest.catalog.service;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.MaterialGroup;
import br.edu.ifpb.alumigest.catalog.domain.UnitMeasure;
import br.edu.ifpb.alumigest.catalog.dto.HardwareRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.HardwareResponseDTO;
import br.edu.ifpb.alumigest.catalog.dto.HardwareUpdatePriceDTO;
import br.edu.ifpb.alumigest.catalog.mapper.HardwareMapper;
import br.edu.ifpb.alumigest.catalog.repository.MaterialGroupRepository;
import br.edu.ifpb.alumigest.catalog.repository.MaterialRepository;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Serviço para gerenciamento de ferragens e acessórios do catálogo.
 *
 * <p>Ferragens <strong>não possuem entidade própria</strong>: são persistidas como
 * instâncias de {@link Material} vinculadas ao grupo nativo {@code FERRAGEM}.
 * Toda operação delega ao {@link MaterialRepository} e ao
 * {@link MaterialGroupRepository}, seguindo o mesmo padrão do {@code FilmService}.</p>
 */
@Service
public class HardwareService {

    private static final String HARDWARE_GROUP_CODE = "FERRAGEM";

    private final MaterialRepository materialRepository;
    private final MaterialGroupRepository materialGroupRepository;
    private final HardwareMapper hardwareMapper;

    public HardwareService(MaterialRepository materialRepository,
                           MaterialGroupRepository materialGroupRepository,
                           HardwareMapper hardwareMapper) {
        this.materialRepository = materialRepository;
        this.materialGroupRepository = materialGroupRepository;
        this.hardwareMapper = hardwareMapper;
    }

    // -------------------------------------------------------------------------
    // Criação
    // -------------------------------------------------------------------------

    /**
     * Cadastra uma nova ferragem verificando unicidade do {@code skuCode}.
     *
     * @param request dados da ferragem a ser criada
     * @return projeção da ferragem persistida
     * @throws BusinessException se o skuCode já existir ou o grupo FERRAGEM não for encontrado
     */
    @Transactional
    public HardwareResponseDTO create(HardwareRequestDTO request) {
        // Validação antecipada: detecta duplicata antes de chegar ao banco,
        // oferecendo mensagem imediata na maioria dos casos.
        if (materialRepository.findBySkuCodeAndIsActiveTrue(request.skuCode()).isPresent()) {
            throw new BusinessException(
                    "Já existe uma ferragem cadastrada com o código: " + request.skuCode());
        }

        MaterialGroup group = resolveHardwareGroup();

        Material material = hardwareMapper.toEntity(request);
        material.setGroup(group);
        material.setActive(true);

        return hardwareMapper.toResponse(materialRepository.save(material));
    }

    // -------------------------------------------------------------------------
    // Leitura
    // -------------------------------------------------------------------------

    /**
     * Lista ferragens ativas com filtro opcional por {@link UnitMeasure} e nome.
     *
     * @param unitMeasure unidade de medida para filtrar (opcional)
     * @param name        fragmento do nome para filtrar (opcional, case-insensitive)
     * @param pageable    configuração de paginação
     * @return página de ferragens
     */
    @Transactional(readOnly = true)
    public Page<HardwareResponseDTO> findAll(UnitMeasure unitMeasure, String name, Pageable pageable) {
        MaterialGroup group = resolveHardwareGroup();
        return materialRepository
                .findAllByGroupFiltered(group.getId(), unitMeasure, name, pageable)
                .map(hardwareMapper::toResponse);
    }

    /**
     * Busca uma ferragem ativa pelo seu {@link UUID}.
     *
     * @param id identificador da ferragem (UUID de {@code Material})
     * @return projeção da ferragem encontrada
     * @throws ResourceNotFoundException se não existir ferragem ativa com o ID informado
     */
    @Transactional(readOnly = true)
    public HardwareResponseDTO findById(UUID id) {
        Material material = materialRepository.findByIdAndGroupCode(id, HARDWARE_GROUP_CODE)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Ferragem não encontrada com ID: " + id));
        return hardwareMapper.toResponse(material);
    }

    // -------------------------------------------------------------------------
    // Atualização
    // -------------------------------------------------------------------------

    /**
     * Atualiza o preço de venda de uma ferragem existente.
     *
     * @param id      identificador da ferragem
     * @param request novo preço de venda
     * @return projeção atualizada
     * @throws ResourceNotFoundException se a ferragem não for encontrada
     */
    @Transactional
    public HardwareResponseDTO updatePrice(UUID id, HardwareUpdatePriceDTO request) {
        Material material = materialRepository.findByIdAndGroupCode(id, HARDWARE_GROUP_CODE)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Ferragem não encontrada com ID: " + id));

        material.setSalePrice(request.salePrice());
        
        if (request.active() != null) {
            material.setActive(request.active());
        }
        
        return hardwareMapper.toResponse(materialRepository.save(material));
    }

    // -------------------------------------------------------------------------
    // Exclusão lógica
    // -------------------------------------------------------------------------

    /**
     * Realiza soft delete de uma ferragem, marcando-a como inativa.
     *
     * @param id identificador da ferragem
     * @throws ResourceNotFoundException se a ferragem não for encontrada
     */
    @Transactional
    public void softDelete(UUID id) {
        Material material = materialRepository.findByIdAndGroupCode(id, HARDWARE_GROUP_CODE)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Ferragem não encontrada com ID: " + id));

        material.setActive(false);
        materialRepository.save(material);
    }

    // -------------------------------------------------------------------------
    // Helpers privados
    // -------------------------------------------------------------------------

    private MaterialGroup resolveHardwareGroup() {
        return materialGroupRepository.findByCode(HARDWARE_GROUP_CODE)
                .orElseThrow(() -> new BusinessException(
                        "Grupo de materiais 'FERRAGEM' não encontrado no sistema."));
    }
}
