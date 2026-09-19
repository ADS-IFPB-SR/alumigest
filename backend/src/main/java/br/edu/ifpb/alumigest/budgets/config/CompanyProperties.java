package br.edu.ifpb.alumigest.budgets.config;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

@Component
@Validated
@ConfigurationProperties(prefix = "empresa")
public class CompanyProperties {

    @NotBlank(message = "A Razão Social da empresa é obrigatória")
    private String razaoSocial;

    @NotBlank(message = "O CNPJ da empresa é obrigatório")
    private String cnpj;

    private String inscricaoEstadual;

    @NotBlank(message = "O telefone da empresa é obrigatório")
    private String telefone;

    @NotBlank(message = "O endereço da empresa é obrigatório")
    private String endereco;

    @NotBlank(message = "A cidade e UF da empresa são obrigatórios")
    private String cidadeUf;

    public String getRazaoSocial() { return razaoSocial; }
    public void setRazaoSocial(String razaoSocial) { this.razaoSocial = razaoSocial; }

    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }

    public String getInscricaoEstadual() { return inscricaoEstadual; }
    public void setInscricaoEstadual(String inscricaoEstadual) { this.inscricaoEstadual = inscricaoEstadual; }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }

    public String getCidadeUf() { return cidadeUf; }
    public void setCidadeUf(String cidadeUf) { this.cidadeUf = cidadeUf; }
}